import requests
from typing import Dict, Optional
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class CEPService:
    """
    Service to fetch address data from CEP using ViaCEP API
    """
    
    BASE_URL = "https://viacep.com.br/ws"
    CACHE_TIMEOUT = 3600  # 1 hour cache
    
    @classmethod
    def fetch_address(cls, cep: str) -> Optional[Dict]:
        """
        Fetch address information from CEP
        
        Args:
            cep: CEP string in format XXXXX-XXX or XXXXXXXX
            
        Returns:
            Dict with address information or None if not found
        """
        # Clean CEP - remove non-numeric characters
        clean_cep = ''.join(filter(str.isdigit, cep))
        
        # Validate CEP format
        if len(clean_cep) != 8:
            return None
            
        # Check cache first
        cache_key = f"cep_{clean_cep}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"CEP {clean_cep} found in cache")
            return cached_result
        
        try:
            # Make request to ViaCEP API
            url = f"{cls.BASE_URL}/{clean_cep}/json/"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Check if CEP was found
            if data.get('erro'):
                logger.warning(f"CEP {clean_cep} not found")
                return None
            
            # Format response
            address_data = {
                'cep': data.get('cep', ''),
                'street': data.get('logradouro', ''),
                'neighborhood': data.get('bairro', ''),
                'city': data.get('localidade', ''),
                'state': data.get('uf', ''),
                'complement': data.get('complemento', ''),
                'ibge': data.get('ibge', ''),
                'gia': data.get('gia', ''),
                'ddd': data.get('ddd', ''),
                'siafi': data.get('siafi', ''),
            }
            
            # Cache the result
            cache.set(cache_key, address_data, cls.CACHE_TIMEOUT)
            logger.info(f"CEP {clean_cep} fetched and cached successfully")
            
            return address_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching CEP {clean_cep}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching CEP {clean_cep}: {e}")
            return None
    
    @classmethod
    def format_cep(cls, cep: str) -> str:
        """
        Format CEP string to XXXXX-XXX format
        
        Args:
            cep: CEP string
            
        Returns:
            Formatted CEP string
        """
        clean_cep = ''.join(filter(str.isdigit, cep))
        if len(clean_cep) == 8:
            return f"{clean_cep[:5]}-{clean_cep[5:]}"
        return cep
    
    @classmethod
    def validate_cep(cls, cep: str) -> bool:
        """
        Validate CEP format
        
        Args:
            cep: CEP string
            
        Returns:
            True if valid CEP format
        """
        clean_cep = ''.join(filter(str.isdigit, cep))
        return len(clean_cep) == 8