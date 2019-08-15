#!/usr/bin/env python
#-*- coding: utf-8 -*-

"""
reference:
http://developer.chrome.com/extensions/crx.html
http://blog.roomanna.com/12-12-2010/packaging-chrome-extensions
https://www.dlitz.net/software/pycrypto/api/current/

get pycrypto
http://www.voidspace.org.uk/python/modules.shtml#pycrypto (windows)
https://www.dlitz.net/software/pycrypto/
"""
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA
import zipfile
import os
import StringIO
import struct
import sys

def pack(extdir,pem,crx_file=None):

    key = RSA.importKey(open(pem).read())
    #export public key
    pub_key = key.publickey().exportKey(format="DER")
    #zip extension directory
    zip_in_memory = StringIO.StringIO()
    with zipfile.ZipFile(zip_in_memory, "w", zipfile.ZIP_DEFLATED) as zip:
        for root,dirs,files in os.walk(extdir):
            for file in files:
                fn = os.path.join(root, file)
                zip.write(fn, os.path.relpath(root,extdir)+os.sep+file)
    zip_content = zip_in_memory.getvalue()
    #sign zip file
    sign = PKCS1_v1_5.new(key).sign(SHA.new(zip_content))

    if not crx_file:
        crx_file = os.path.basename(extdir)+".crx"
    with open(crx_file, "wb") as crx:
        crx.write("Cr24") #magic number
        crx.write(struct.pack("<I", 2)) #crx spec version
        crx.write(struct.pack("<I", len(pub_key))) #the length of public key
        crx.write(struct.pack("<I", len(sign))) #the length of signature
        crx.write(pub_key)
        crx.write(sign)
        crx.write(zip_content)
        crx.flush()

if __name__ == "__main__":
    pack(sys.argv[1], sys.argv[2])
