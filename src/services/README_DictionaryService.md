# DictionaryService

A high-performance Python dictionary service for SQLite-based word lookups with efficient caching and robust error handling.

## Overview

The `DictionaryService` provides a singleton service for querying the stardict SQLite database containing 3.4+ million English word entries. It features LRU caching, parameterized queries, and multiple fallback strategies for maximum performance and reliability.

## Features

- **Singleton Pattern**: Ensures only one service instance exists per database path
- **LRU Caching**: 2048-entry cache with automatic eviction of least-used items
- **Read-Only Mode**: Opens database in read-only mode for optimal performance
- **Parameterized Queries**: Prevents SQL injection vulnerabilities
- **Multiple Lookup Strategies**:
  1. Exact word match (indexed)
  2. Simplified word match (sw column)
  3. Base word extraction from inflected forms
  4. Fuzzy matching using LIKE patterns
- **Robust Error Handling**: Graceful fallbacks for database locks, missing tables, etc.
- **Schema Validation**: Automatic validation on initialization
- **Type Hints**: Full type annotations for IDE support

## Database Schema

The service connects to `stardict.db` containing the `stardict` table:

| Column        | Type            | Description                               |
|--------------|-----------------|------------------------------------------|
| id           | INTEGER         | Primary key                               |
| word         | VARCHAR(64)     | Word entry (indexed)                      |
| sw           | VARCHAR(64)     | Simplified word form (indexed)            |
| phonetic     | VARCHAR(64)     | Phonetic transcription                    |
| definition   | TEXT            | English definition                        |
| translation  | TEXT            | Chinese translation                       |
| pos          | VARCHAR(16)     | Part of speech                            |
| collins      | INTEGER         | Collins frequency rank                    |
| oxford       | INTEGER         | Oxford frequency rank                     |
| bnc          | INTEGER         | British National Corpus frequency          |
| frq          | INTEGER         | General frequency score                   |
| tag          | VARCHAR(64)     | Additional tags                           |
| exchange     | TEXT            | Word inflections/variants                 |
| detail       | TEXT            | Detailed information                      |
| audio        | TEXT            | Audio reference                           |

## Installation

The database file must be located at:
```
D:\Games\qwerty2\sentence-flow\dist\dicts\stardict.db
```

## Usage

### Basic Usage

```python
from dictionary_service import get_dictionary_service

# Get the singleton service instance
service = get_dictionary_service()

# Lookup a word
result = service.get_definition("hello")
if result:
    print(f"Word: {result.text}")
    print(f"Phonetic: {result.phonetic}")
    print(f"POS: {result.pos}")
    print(f"Meaning: {result.meaning}")
```

### Custom Database Path

```python
from dictionary_service import DictionaryService

service = DictionaryService(r"C:\path\to\custom\database.db")
result = service.get_definition("computer")
```

### Batch Lookup

```python
words = ["python", "javascript", "java", "rust", "go"]
results = service.batch_get_definitions(words)

for word, definition in results.items():
    print(f"{word}: {definition.phonetic}")
```

### Cache Management

```python
# Get cache statistics
cache_info = service.get_cache_info()
print(f"Hit rate: {cache_info['hit_rate']:.2%}")
print(f"Cache size: {cache_info['currsize']}")

# Clear cache
service.clear_cache()
```

### Database Information

```python
info = service.get_database_info()
print(f"Total words: {info['total_words']:,}")
print(f"Database size: {info['database_size_mb']:.2f} MB")
```

## API Reference

### `WordDefinition`

Data class representing a word definition:

- `text`: Word text
- `phonetic`: Phonetic transcription
- `pos`: Part of speech
- `meaning`: Translation or definition
- `translation`: Chinese translation
- `definition`: English definition
- `collins`: Collins frequency rank
- `oxford`: Oxford frequency rank
- `bnc`: BNC frequency
- `frq`: General frequency
- `tag`: Tags
- `exchange`: Word inflections
- `detail`: Detailed information
- `audio`: Audio reference

### `DictionaryService.get_definition(word: str) -> Optional[WordDefinition]`

Lookup a word with multiple fallback strategies.

**Parameters:**
- `word`: Word to lookup

**Returns:**
- `WordDefinition` if found, `None` otherwise

**Example:**
```python
result = service.get_definition("running")
# Will find "run" and adapt for inflection
```

### `DictionaryService.batch_get_definitions(words: List[str], skip_cache: bool = False) -> Dict[str, WordDefinition]`

Lookup multiple words efficiently.

**Parameters:**
- `words`: List of words to lookup
- `skip_cache`: If True, bypass cache for fresh lookups

**Returns:**
- Dictionary mapping words to their definitions

### `DictionaryService.clear_cache() -> None`

Clear the LRU cache.

### `DictionaryService.get_cache_info() -> Dict[str, Any]`

Get cache statistics including hits, misses, and hit rate.

### `DictionaryService.get_database_info() -> Dict[str, Any]`

Get database statistics and information.

## Performance

- **Database Size**: ~812 MB
- **Total Words**: 3,402,564
- **Cache Size**: 2,048 entries
- **Query Type**: Indexed lookups (O(log n))
- **Connection Mode**: Read-only with optimized PRAGMA settings

## Error Handling

The service includes robust error handling for:

- **DatabaseNotFoundError**: Database file doesn't exist
- **DatabaseLockedError**: Database is locked by another process
- **DatabaseError**: General database errors including:
  - Missing tables
  - Invalid schema
  - Database corruption
  - Connection errors

## Thread Safety

The service is thread-safe and can be used across multiple threads:
- Singleton pattern ensures single instance
- SQLite connections are created per context
- LRU cache is thread-safe

## Testing

Run the test suite:

```bash
python test_dict_simple.py
```

Expected output:
```
[OK] All tests completed successfully!
```

## Integration with JavaScript

The Python service can be integrated with the existing JavaScript codebase via:

1. **Node.js Child Process**: Spawn Python process for queries
2. **Python Subprocess**: Call Python scripts from JavaScript
3. **HTTP API**: Expose service via REST API (future)
4. **WebSocket**: Real-time dictionary lookups (future)

Example Node.js integration:

```javascript
const { spawn } = require('child_process');

function lookupWord(word) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'scripts/lookup.py',
      word
    ]);
    
    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error('Lookup failed'));
      }
    });
  });
}
```

## License

Part of the sentence-flow project.

## Contributing

To extend the service:

1. Add new lookup strategies in `get_definition()`
2. Extend `WordDefinition` for additional fields
3. Add validation rules in `_validate_schema()`
4. Implement new caching strategies
