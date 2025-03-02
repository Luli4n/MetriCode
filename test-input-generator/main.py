import json
import os
from faker import Faker
from datetime import datetime

fake = Faker()

OUTPUT_DIR = "test_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

RECORD_SIZES = {
    "small": 100,
    "medium": 1_000,
    "large": 10_000
}

def generate_simple_json(idx):
    return {
        "id": idx,
        "name": fake.first_name(),
        "email": fake.email(),
        "age": fake.random_int(min=18, max=80),
        "active": fake.boolean()
    }

def generate_nested_json(idx):
    return {
        "id": idx,
        "user": {
            "email": fake.email(),
            "social": {
                "nickname": fake.user_name(),
                "posts": {
                    "post_id": idx,
                    "timestamp": datetime.utcnow().isoformat(),
                    "content": fake.text(max_nb_chars=500),
                    "likes": fake.random_int(min=0, max=50_000_000),
                    "comments": [
                        {
                            "user_id": idx + i + 1,
                            "timestamp": datetime.utcnow().isoformat(),
                            "content": fake.text(max_nb_chars=500),
                            "likes": fake.random_int(min=0, max=100_000)
                        }
                        for i in range(fake.random_int(min=0, max=100))
                    ]
                }
            }
        }
    }

def generate_large_json(idx):
    return {
        "id": idx,
        "content": fake.text(max_nb_chars=fake.random_int(min=10_000, max=100_000))
    }

def save_json_file(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

for size_name, record_count in RECORD_SIZES.items():
    print(f"Generowanie {size_name} zestawu ({record_count} rekordów)")

    simple_data = [generate_simple_json(idx) for idx in range(1, record_count + 1)]
    save_json_file(simple_data, os.path.join(OUTPUT_DIR, f"simple_{size_name}.json"))

    nested_data = [generate_nested_json(idx) for idx in range(1, record_count + 1)]
    save_json_file(nested_data, os.path.join(OUTPUT_DIR, f"nested_{size_name}.json"))

    large_data = [generate_large_json(idx) for idx in range(1, record_count + 1)]
    save_json_file(large_data, os.path.join(OUTPUT_DIR, f"large_{size_name}.json"))

print("Generowanie zakończone. Pliki zapisane w katalogu 'test_data'.")