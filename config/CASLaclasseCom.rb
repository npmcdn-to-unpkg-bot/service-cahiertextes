# -*- coding: utf-8 -*-

# CAS Configuration.
module CASLaclasseCom
  OPTIONS = { host: 'www.dev.laclasse.com',
              ssl: true,
              port: 443,
              disable_ssl_verification: true,
              login_url: '/sso-mysql/login',
              service_validate_url: '/sso-mysql/serviceValidate',
              logout_url: '/sso-mysql/logout' }
  APIKEY = 'f3f5efb72a0661e19564bacfa3dcc908b1712133637989a0825748ab9938c243'
end