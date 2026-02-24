"""
SQLite to JSON Export Script for ECDict Database

Exports stardict.db to JSON format for IndexedDB loading.
Lower frequency numbers = more common words (BNC/FRQ rank).
"""

import sqlite3
import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# Fix encoding for Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")


class SQLiteToJSONExporter:
    def __init__(self, db_path: str, output_dir: str):
        self.db_path = Path(db_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def connect_db(self):
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        return sqlite3.connect(str(self.db_path))
    
    def export_word(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert database row to JSON format."""
        return {
            "text": row["word"],
            "phonetic": row["phonetic"] or "",
            "pos": row["pos"] or "",
            "meaning": row["translation"] or row["definition"] or "",
            "definition": row["definition"] or "",
            "collins": row["collins"] or 0,
            "oxford": bool(row["oxford"]),
            "tag": row["tag"] or "",
            "bnc": row["bnc"] or 0,
            "frq": row["frq"] or 0,
            "exchange": row["exchange"] or "",
            "detail": row["detail"] or "",
            "audio": row["audio"] or ""
        }
    
    def export_common_words(self, count: int):
        """
        Export N most common words by frequency.
        Lower BNC/FRQ values = more common.
        """
        print(f"\n{'='*60}")
        print(f"Exporting {count} most common words")
        print(f"{'='*60}\n")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        # Query: get words with lowest frequency numbers (most common)
        # Use COALESCE to handle NULL values
        query = """
            SELECT * FROM stardict 
            WHERE bnc > 0 OR frq > 0 
            ORDER BY COALESCE(bnc, 9999999), COALESCE(frq, 9999999) 
            LIMIT ?
        """
        
        cursor.execute(query, (count,))
        rows = cursor.fetchall()
        
        columns = [desc[0] for desc in cursor.description]
        
        words = []
        for i, row in enumerate(rows, 1):
            word_dict = dict(zip(columns, row))
            words.append(self.export_word(word_dict))
            
            # Progress update every 5000 words
            if i % 5000 == 0:
                progress = (i / count) * 100
                print(f"  Progress: {i}/{count} ({progress:.1f}%)...")
        
        # Save to JSON
        output_file = self.output_dir / f"ecdict-{count}k.json"
        print(f"\n  Writing to {output_file}...")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=2)
        
        file_size_mb = output_file.stat().st_size / 1024 / 1024
        print(f"\n[OK] Exported {len(words)} words to {output_file}")
        print(f"     File size: {file_size_mb:.2f} MB")
        print(f"     Avg per word: {file_size_mb * 1024 / len(words):.2f} KB")
        
        conn.close()
        return output_file
    
    def export_sample(self, count: int = 100):
        """Export sample words for testing."""
        print(f"\n{'='*60}")
        print(f"Exporting {count} sample words")
        print(f"{'='*60}\n")
        
        conn = self.connect_db()
        cursor = conn.cursor()
        
        query = """
            SELECT * FROM stardict 
            WHERE bnc > 0 AND bnc < 10000
            ORDER BY bnc 
            LIMIT ?
        """
        
        cursor.execute(query, (count,))
        rows = cursor.fetchall()
        
        columns = [desc[0] for desc in cursor.description]
        
        words = []
        for row in rows:
            word_dict = dict(zip(columns, row))
            words.append(self.export_word(word_dict))
        
        output_file = self.output_dir / "ecdict-sample-new.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=2)
        
        print(f"\n[OK] Exported {len(words)} words to {output_file}")
        print(f"     File size: {output_file.stat().st_size / 1024:.2f} KB")
        
        conn.close()
        return output_file


def main():
    parser = argparse.ArgumentParser(
        description="Export ECDict SQLite database to JSON format"
    )
    parser.add_argument(
        "--db", 
        default="../ecdict-sqlite-28/stardict.db",
        help="Path to SQLite database file"
    )
    parser.add_argument(
        "--output", 
        default="../public/dicts",
        help="Output directory for JSON files"
    )
    
    mode_group = parser.add_mutually_exclusive_group(required=True)
    mode_group.add_argument(
        "--common",
        type=int,
        metavar="N",
        help="Export N most common words"
    )
    mode_group.add_argument(
        "--sample",
        type=int,
        nargs="?",
        const=100,
        metavar="N",
        help="Export N sample words for testing (default: 100)"
    )
    
    args = parser.parse_args()
    
    exporter = SQLiteToJSONExporter(args.db, args.output)
    
    start_time = datetime.now()
    
    if args.common:
        exporter.export_common_words(args.common)
    elif args.sample:
        exporter.export_sample(args.sample)
    
    duration = datetime.now() - start_time
    print(f"\n[OK] Export completed in {duration}")


if __name__ == "__main__":
    main()
