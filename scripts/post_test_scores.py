import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys
import random
from datetime import datetime

def post_test_scores():
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
        
        # Test data
        test_players = [
            "Player1", "Player2", "Player3", "Player4", "Player5",
            "TestUser", "GameMaster", "SpeedRunner", "ProGamer", "Newbie"
        ]
        
        # Ask for number of scores to generate
        num_scores = input("How many test scores do you want to generate? (default: 10): ")
        num_scores = int(num_scores) if num_scores.isdigit() else 10
        
        # Ask for level
        level = input("Which level? (default: 0): ")
        level = int(level) if level.isdigit() else 0
        
        # Generate and insert scores
        scores = []
        for _ in range(num_scores):
            score = {
                "playerName": random.choice(test_players),
                "time": round(random.uniform(30.0, 300.0), 2),  # Random time between 30 and 300 seconds
                "level": level,
                "createdAt": datetime.utcnow()
            }
            scores.append(score)
        
        # Insert scores
        result = collection.insert_many(scores)
        print(f"\nSuccessfully inserted {len(result.inserted_ids)} test scores!")
        print(f"Level: {level}")
        print("\nInserted scores:")
        for score in scores:
            print(f"Player: {score['playerName']}, Time: {score['time']}s")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    post_test_scores() 