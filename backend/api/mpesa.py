import requests
import base64
from datetime import datetime
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class MpesaClient:
    """M-Pesa Daraja API client for STK Push payments"""
    
    def __init__(self):
        self.consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        self.consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        self.business_short_code = getattr(settings, 'MPESA_SHORTCODE', '')
        self.passkey = getattr(settings, 'MPESA_PASSKEY', '')
        self.callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        self.environment = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        
        # Set API URLs based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        
        self.auth_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        self.query_url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
    
    def get_access_token(self):
        """Get OAuth access token from M-Pesa API"""
        try:
            logger.info(f"Attempting to get access token from: {self.auth_url}")
            logger.info(f"Using consumer key: {self.consumer_key[:10]}...")
            
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                'Authorization': f'Basic {auth_base64}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(self.auth_url, headers=headers)
            
            logger.info(f"Auth response status: {response.status_code}")
            if response.status_code != 200:
                logger.error(f"Auth response body: {response.text}")
            
            response.raise_for_status()
            
            json_response = response.json()
            logger.info("Access token obtained successfully")
            return json_response.get('access_token')
        
        except Exception as e:
            logger.error(f"Error getting M-Pesa access token: {str(e)}")
            return None
    
    def generate_password(self):
        """Generate password for STK push"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_short_code}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode())
        return encoded.decode('utf-8'), timestamp
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push payment
        
        Args:
            phone_number (str): Customer phone number in format 254XXXXXXXXX
            amount (int): Amount to charge
            account_reference (str): Account reference (e.g., appointment ID)
            transaction_desc (str): Transaction description
        
        Returns:
            dict: API response with CheckoutRequestID or error
        """
        access_token = self.get_access_token()
        if not access_token:
            return {
                'success': False,
                'error': 'Failed to get access token'
            }
        
        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Format phone number - ensure it starts with 254
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+254'):
            phone_number = phone_number[1:]
        elif phone_number.startswith('254'):
            pass
        else:
            phone_number = '254' + phone_number
        
        payload = {
            'BusinessShortCode': self.business_short_code,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': self.business_short_code,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc
        }
        
        try:
            logger.info(f"Initiating STK push with payload: {payload}")
            response = requests.post(self.stk_push_url, json=payload, headers=headers)
            
            json_response = response.json()
            logger.info(f"M-Pesa STK push response: {json_response}")
            
            if json_response.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'CheckoutRequestID': json_response.get('CheckoutRequestID'),
                    'MerchantRequestID': json_response.get('MerchantRequestID'),
                    'ResponseDescription': json_response.get('ResponseDescription'),
                    'CustomerMessage': json_response.get('CustomerMessage')
                }
            else:
                error_msg = json_response.get('errorMessage') or json_response.get('ResponseDescription', 'Payment initiation failed')
                logger.error(f"M-Pesa error: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP error initiating STK push: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response body: {e.response.text}")
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error initiating STK push: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def query_transaction(self, checkout_request_id):
        """
        Query the status of an STK Push transaction
        
        Args:
            checkout_request_id (str): CheckoutRequestID from STK push
        
        Returns:
            dict: Transaction status
        """
        logger.info(f"Querying transaction for CheckoutRequestID: {checkout_request_id}")
        
        access_token = self.get_access_token()
        if not access_token:
            logger.error("Failed to get access token for query")
            return {
                'success': False,
                'error': 'Failed to get access token'
            }
        
        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_short_code,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id
        }
        
        try:
            logger.info(f"Sending query request to: {self.query_url}")
            response = requests.post(self.query_url, json=payload, headers=headers)
            
            json_response = response.json()
            logger.info(f"Query response: {json_response}")
            
            response.raise_for_status()
            
            return {
                'success': True,
                'data': json_response
            }
        
        except Exception as e:
            logger.error(f"Error querying transaction: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response body: {e.response.text}")
            return {
                'success': False,
                'error': str(e)
            }
