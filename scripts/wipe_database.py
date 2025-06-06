import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys

def wipe_database():
    # Load environment variables
    load_dotenv()
    
    # Get MongoDB connection string from environment variable
    mongo_uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('DB_NAME')  # Your database name
    collection_name = os.getenv('COLLECTION_NAME')  # Your database collections
    
    if not mongo_uri or not db_name or not collection_name:
        print("Error: Missing required environment variables (MONGODB_URI, DB_NAME, or COLLECTION_NAME)")
        sys.exit(1)
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        # Check if collection exists
        if collection_name not in db.list_collection_names():
            print(f"Error: Collection '{collection_name}' not found in database '{db_name}'")
            return
        
        # Get count of documents before deletion
        doc_count = db[collection_name].count_documents({})
        
        # Ask for confirmation
        print(f"\nWARNING: This will permanently delete all {doc_count} documents in collection '{collection_name}'!")
        confirmation = input("\nType 'DELETE' to confirm: ")
        
        if confirmation != 'DELETE':
            print("Operation cancelled")
            return
        
        # Delete all documents in the collection
        result = db[collection_name].delete_many({})
        print(f"Deleted {result.deleted_count} documents from collection: {collection_name}")
        print("\nDocument deletion completed successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    wipe_database() 