import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys
from datetime import datetime

def add_score():
    # Load environment variables
    load_dotenv()
    
    # Get MongoDB connection string from environment variable
    mongo_uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('DB_NAME')
    collection_name = os.getenv('COLLECTION_NAME')
    
    if not mongo_uri or not db_name or not collection_name:
        print("Error: Missing required environment variables")
        sys.exit(1)
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]
        
        # Get player name
        player_name = input("Enter player name: ").strip()
        if not player_name:
            print("Error: Player name cannot be empty")
            return
        
        # Get time
        while True:
            try:
                time = float(input("Enter time (in seconds): "))
                if time <= 0 or time > 300:
                    print("Error: Time must be between 0 and 300 seconds")
                    continue
                break
            except ValueError:
                print("Error: Please enter a valid number")
        
        # Get level
        while True:
            try:
                level = int(input("Enter level (default: 0): ") or "0")
                if level < 0:
                    print("Error: Level cannot be negative")
                    continue
                break
            except ValueError:
                print("Error: Please enter a valid number")
        
        # Create score document
        score = {
            "playerName": player_name,
            "time": time,
            "level": level,
            "createdAt": datetime.utcnow()
        }
        
        # Insert score
        result = collection.insert_one(score)
        
        print("\nScore added successfully!")
        print(f"Player: {player_name}")
        print(f"Time: {time} seconds")
        print(f"Level: {level}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    add_score() 