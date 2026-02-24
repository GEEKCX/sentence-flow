"""
Dictionary Service Module

Provides high-performance dictionary lookup service for word definitions
with SQLite database integration, caching, and fallback mechanisms.
"""

import sqlite3
import threading
from contextlib import contextmanager
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging


@dataclass
class WordDefinition:
    """Represents a word definition with all relevant information."""
    text: str
    phonetic: str = ""
    pos: str = ""
    meaning: str = ""
    translation: str = ""
    definition: str = ""
    phonetic_uk: str = ""
    phonetic_us: str = ""
    collins: Optional[int] = None
    oxford: Optional[int] = None
    bnc: Optional[int] = None
    frq: Optional[int] = None
    tag: str = ""
    exchange: str = ""
    detail: str = ""
    audio: str = ""


class DatabaseError(Exception):
    """Base exception for database-related errors."""
    pass


class DatabaseLockedError(DatabaseError):
    """Raised when database is locked."""
    pass


class DatabaseNotFoundError(DatabaseError):
    """Raised when database file is not found."""
    pass


class DictionaryService:
    """
    Singleton dictionary service for efficient word lookups in SQLite database.
    
    Features:
    - Context manager-based connection handling
    - LRU caching for frequently accessed words
    - Parameterized queries for SQL injection prevention
    - Read-only mode for improved performance
    - Robust error handling and fallback mechanisms
    - Schema validation on initialization
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, db_path: Optional[str] = None):
        """Singleton pattern implementation."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize DictionaryService.
        
        Args:
            db_path: Path to SQLite database file. If None, uses default path.
        
        Raises:
            DatabaseNotFoundError: If database file doesn't exist
            DatabaseError: If database schema is invalid
        """
        if self._initialized:
            return
        
        self._db_path = Path(db_path) if db_path else Path(
            r"D:\Games\qwerty2\sentence-flow\dist\dicts\stardict.db"
        )
        
        self._logger = logging.getLogger(__name__)
        self._validate_database_path()
        self._validate_schema()
        self._initialized = True
        
    def _validate_database_path(self) -> None:
        """Validate that database file exists and is accessible."""
        if not self._db_path.exists():
            raise DatabaseNotFoundError(
                f"Database file not found: {self._db_path}\n"
                f"Please ensure the stardict.db file exists at the specified location."
            )
        
        if not self._db_path.is_file():
            raise DatabaseError(
                f"Database path exists but is not a file: {self._db_path}"
            )
    
    @contextmanager
    def _get_connection(self):
        """
        Context manager for database connections with automatic cleanup.
        
        Yields:
            sqlite3.Connection: Active database connection in read-only mode.
        
        Raises:
            DatabaseLockedError: If database is locked
            DatabaseError: For other database errors
        """
        conn = None
        try:
            conn = sqlite3.connect(
                f"file:{self._db_path}?mode=ro",
                uri=True,
                check_same_thread=False
            )
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA read_only = ON")
            conn.execute("PRAGMA journal_mode = OFF")
            conn.execute("PRAGMA synchronous = OFF")
            conn.execute("PRAGMA temp_store = MEMORY")
            yield conn
        except sqlite3.OperationalError as e:
            if "locked" in str(e).lower() or "database is locked" in str(e).lower():
                raise DatabaseLockedError(f"Database is locked: {e}")
            raise DatabaseError(f"Database operational error: {e}")
        except sqlite3.Error as e:
            raise DatabaseError(f"Database error: {e}")
        finally:
            if conn:
                conn.close()
    
    def _validate_schema(self) -> None:
        """
        Validate database schema structure.
        
        Raises:
            DatabaseError: If schema is invalid or missing required columns
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='stardict';"
                )
                if not cursor.fetchone():
                    raise DatabaseError(
                        f"Required table 'stardict' not found in database: {self._db_path}"
                    )
                
                cursor.execute("PRAGMA table_info(stardict);")
                columns = {row[1] for row in cursor.fetchall()}
                
                required_columns = {
                    'id', 'word', 'phonetic', 'definition', 
                    'translation', 'pos'
                }
                
                missing_columns = required_columns - columns
                if missing_columns:
                    raise DatabaseError(
                        f"Missing required columns in 'stardict' table: {missing_columns}\n"
                        f"Available columns: {columns}"
                    )
                
                cursor.execute("PRAGMA index_list(stardict);")
                indexes = cursor.fetchall()
                
                has_word_index = False
                for idx in indexes:
                    idx_name = idx[1] if len(idx) > 1 else ''
                    cursor.execute(f"PRAGMA index_info({idx_name});")
                    idx_cols = cursor.fetchall()
                    if any(col[2] == 'word' or col[2] == 'sw' for col in idx_cols):
                        has_word_index = True
                        break
                
                if not has_word_index:
                    self._logger.warning(
                        "No index found on 'word' column. "
                        "Query performance may be affected."
                    )
                else:
                    self._logger.info("Index found on 'word' column.")
                
                cursor.execute("PRAGMA integrity_check;")
                integrity = cursor.fetchone()[0]
                if integrity != 'ok':
                    raise DatabaseError(
                        f"Database integrity check failed: {integrity}\n"
                        f"Database may be corrupted: {self._db_path}"
                    )
                    
        except (DatabaseLockedError, DatabaseError):
            raise
        except Exception as e:
            raise DatabaseError(f"Schema validation failed: {e}")
    
    def _row_to_definition(self, row: sqlite3.Row, word: str) -> WordDefinition:
        """
        Convert database row to WordDefinition object.
        
        Args:
            row: Database row from stardict table
            word: Original word searched for
        
        Returns:
            WordDefinition: Parsed word definition
        """
        definition = row['definition'] or ""
        translation = row['translation'] or ""
        
        collins = row['collins'] if 'collins' in row.keys() else None
        oxford = row['oxford'] if 'oxford' in row.keys() else None
        bnc = row['bnc'] if 'bnc' in row.keys() else None
        frq = row['frq'] if 'frq' in row.keys() else None
        tag = row['tag'] if 'tag' in row.keys() else ""
        exchange = row['exchange'] if 'exchange' in row.keys() else ""
        detail = row['detail'] if 'detail' in row.keys() else ""
        audio = row['audio'] if 'audio' in row.keys() else ""
        
        return WordDefinition(
            text=word,
            phonetic=row['phonetic'] or "",
            pos=row['pos'] or "",
            meaning=translation if translation else definition,
            translation=translation,
            definition=definition,
            collins=collins,
            oxford=oxford,
            bnc=bnc,
            frq=frq,
            tag=tag,
            exchange=exchange,
            detail=detail,
            audio=audio
        )
    
    def _query_exact_match(self, word: str) -> Optional[WordDefinition]:
        """
        Query database for exact word match.
        
        Args:
            word: Word to search for
        
        Returns:
            WordDefinition if found, None otherwise
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM stardict WHERE word = ? COLLATE NOCASE LIMIT 1;",
                    (word,)
                )
                row = cursor.fetchone()
                if row:
                    return self._row_to_definition(row, word)
        except DatabaseLockedError:
            self._logger.warning(f"Database locked during exact match for: {word}")
        except Exception as e:
            self._logger.error(f"Error querying exact match for '{word}': {e}")
        
        return None
    
    def _query_simplified_match(self, word: str) -> Optional[WordDefinition]:
        """
        Query database for simplified word match (sw column).
        
        Args:
            word: Word to search for
        
        Returns:
            WordDefinition if found, None otherwise
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM stardict WHERE sw = ? COLLATE NOCASE LIMIT 1;",
                    (word,)
                )
                row = cursor.fetchone()
                if row:
                    return self._row_to_definition(row, word)
        except DatabaseLockedError:
            self._logger.warning(f"Database locked during simplified match for: {word}")
        except Exception as e:
            self._logger.error(f"Error querying simplified match for '{word}': {e}")
        
        return None
    
    def _query_fuzzy_match(self, word: str, max_results: int = 3) -> Optional[WordDefinition]:
        """
        Query database for fuzzy word matches using LIKE pattern.
        
        Args:
            word: Word to search for
            max_results: Maximum number of results to return
        
        Returns:
            Best matching WordDefinition if found, None otherwise
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    f"SELECT * FROM stardict WHERE word LIKE ? COLLATE NOCASE ORDER BY LENGTH(word) ASC LIMIT {max_results};",
                    (f"%{word}%",)
                )
                rows = cursor.fetchall()
                if rows:
                    return self._row_to_definition(rows[0], word)
        except DatabaseLockedError:
            self._logger.warning(f"Database locked during fuzzy match for: {word}")
        except Exception as e:
            self._logger.error(f"Error querying fuzzy match for '{word}': {e}")
        
        return None
    
    def _get_base_word(self, word: str) -> Optional[str]:
        """
        Extract base word form from inflected forms.
        
        Args:
            word: Word to process
        
        Returns:
            Base word if pattern matches, None otherwise
        """
        lower_word = word.lower()
        
        suffixes = {
            'ing': 3,
            'ed': 2,
            'ies': 3,
            'es': 2,
            's': 1,
            'er': 2,
            'est': 3
        }
        
        for suffix, length in suffixes.items():
            if lower_word.endswith(suffix) and len(lower_word) > length + 2:
                base = lower_word[:-length]
                if suffix == 'ies':
                    base += 'y'
                return base
        
        return None
    
    @lru_cache(maxsize=2048)
    def get_definition(self, word: str) -> Optional[WordDefinition]:
        """
        Get word definition with multiple fallback strategies.
        
        Lookup order:
        1. Exact match on word column
        2. Match on simplified word (sw) column
        3. Extract base word and retry exact match
        4. Fuzzy match using LIKE pattern
        
        Args:
            word: Word to lookup
        
        Returns:
            WordDefinition if found, None otherwise
        
        Raises:
            DatabaseError: If database becomes inaccessible
        """
        if not word or not isinstance(word, str):
            return None
        
        word = word.strip()
        if not word:
            return None
        
        result = self._query_exact_match(word)
        if result:
            return result
        
        result = self._query_simplified_match(word)
        if result:
            return result
        
        base_word = self._get_base_word(word)
        if base_word and base_word != word.lower():
            result = self._query_exact_match(base_word)
            if result:
                result.text = word
                return result
            
            result = self._query_simplified_match(base_word)
            if result:
                result.text = word
                return result
        
        result = self._query_fuzzy_match(word)
        if result:
            return result
        
        return None
    
    def batch_get_definitions(
        self, 
        words: List[str], 
        skip_cache: bool = False
    ) -> Dict[str, WordDefinition]:
        """
        Get definitions for multiple words efficiently.
        
        Args:
            words: List of words to lookup
            skip_cache: If True, bypass cache for fresh lookups
        
        Returns:
            Dictionary mapping words to their definitions
        """
        results = {}
        
        for word in words:
            if not word:
                continue
            
            if skip_cache:
                self.get_definition.cache_clear()
            
            result = self.get_definition(word.strip())
            if result:
                results[word] = result
        
        return results
    
    def clear_cache(self) -> None:
        """Clear the LRU cache."""
        self.get_definition.cache_clear()
        if hasattr(self, '_logger'):
            self._logger.info("Dictionary service cache cleared")
    
    def get_cache_info(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache information
        """
        info = self.get_definition.cache_info()
        return {
            'hits': info.hits,
            'misses': info.misses,
            'maxsize': info.maxsize,
            'currsize': info.currsize,
            'hit_rate': info.hits / (info.hits + info.misses) if (info.hits + info.misses) > 0 else 0
        }
    
    def get_database_info(self) -> Dict[str, Any]:
        """
        Get database statistics and information.
        
        Returns:
            Dictionary with database information
        
        Raises:
            DatabaseError: If database is inaccessible
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT COUNT(*) FROM stardict;")
                total_words = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(DISTINCT word) FROM stardict;")
                distinct_words = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM stardict WHERE phonetic IS NOT NULL;")
                words_with_phonetic = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM stardict WHERE definition IS NOT NULL;")
                words_with_definition = cursor.fetchone()[0]
                
                cursor.execute("PRAGMA page_size;")
                page_size = cursor.fetchone()[0]
                
                cursor.execute("PRAGMA page_count;")
                page_count = cursor.fetchone()[0]
                
                db_size_bytes = page_size * page_count
                db_size_mb = db_size_bytes / (1024 * 1024)
                
                return {
                    'database_path': str(self._db_path),
                    'total_words': total_words,
                    'distinct_words': distinct_words,
                    'words_with_phonetic': words_with_phonetic,
                    'words_with_definition': words_with_definition,
                    'database_size_mb': round(db_size_mb, 2),
                    'page_size': page_size,
                    'page_count': page_count
                }
        except Exception as e:
            raise DatabaseError(f"Failed to get database info: {e}")


def get_dictionary_service(db_path: Optional[str] = None) -> DictionaryService:
    """
    Get the singleton DictionaryService instance.
    
    Args:
        db_path: Optional custom database path
    
    Returns:
        DictionaryService: Singleton instance
    """
    return DictionaryService(db_path)
