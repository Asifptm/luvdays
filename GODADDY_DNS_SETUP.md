# 🌐 GoDaddy DNS Setup Guide for luvdays.com

## 🎯 **Overview**
This guide will help you configure DNS records in GoDaddy for your Days AI application with custom domains.

## 📋 **DNS Records to Add in GoDaddy**

### **Step 1: Certificate Validation Record**
Add this CNAME record for SSL certificate validation:

- **Type**: CNAME
- **Name**: `_88c5498c619ed60990ea8ab476d3e480`
- **Value**: `_9a48c7807545c59eb80ada66e63fc3cf.xlfgrmvvlj.acm-validations.aws.`
- **TTL**: 600

**Note**: This is the same validation record as before since it's for the same domain.

### **Step 2: API Subdomain Record**
After backend deployment, add this A record:

- **Type**: A
- **Name**: `api`
- **Value**: `d-4gb19ghf2j.execute-api.ap-south-1.amazonaws.com`
- **TTL**: 600

### **Step 3: App Subdomain Record**
After frontend deployment, add this A record:

- **Type**: A
- **Name**: `app`
- **Value**: `dxkgld6hnshoo.cloudfront.net`
- **TTL**: 600

## 🚀 **How to Add Records in GoDaddy**

1. **Log into GoDaddy.com**
2. **Go to "My Products"**
3. **Find "luvdays.com" and click "DNS"**
4. **Click "Add" to add new records**
5. **Add each record as specified above**

## ⏳ **Timeline**

1. **Add certificate validation record** → Wait 5-10 minutes
2. **Deploy backend** → Get API endpoint IP
3. **Add API A record** → Wait 5-10 minutes
4. **Deploy frontend** → Get app endpoint IP
5. **Add app A record** → Wait 5-10 minutes

## 🔍 **Verification**

After adding records, verify with:
```bash
nslookup api.luvdays.com
nslookup app.luvdays.com
```

## 📞 **Support**

If you need help with GoDaddy DNS configuration, their support can assist you with adding these records.

---

**Next Step**: Add the certificate validation CNAME record in GoDaddy, then we'll proceed with deployment!
