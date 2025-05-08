import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

cred = credentials.Certificate(os.environ.get('FIREBASE_CREDENTIALS_PATH'))
firebase_app = firebase_admin.initialize_app(cred)
db = firestore.client()

def get_firebase_user(user_id):
    try:
        return auth.get_user(user_id)
    except:
        return None