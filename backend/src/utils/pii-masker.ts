const PII_FIELDS = ['email', 'phone', 'name', 'aadhaar', 'dob', 'contact'];

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const domainParts = domain.split('.');
  const maskedLocal = local.charAt(0) + '***';
  const maskedDomain = domainParts[0].charAt(0) + '***';
  const tld = domainParts.slice(1).join('.');
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return '******' + digits.slice(-4);
}

export function maskName(name: string): string {
  if (!name) return name;
  return name
    .split(' ')
    .map((part) => {
      if (part.length <= 1) return part;
      return part.charAt(0) + '*'.repeat(part.length - 1);
    })
    .join(' ');
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return aadhaar;
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return '********' + digits.slice(-4);
}

export function maskObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => maskObject(item)) as unknown as T;
  }

  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      masked[key] = maskObject(value);
    } else if (Array.isArray(value)) {
      masked[key] = value.map((item) =>
        typeof item === 'object' ? maskObject(item) : item
      );
    } else if (typeof value === 'string') {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'email') {
        masked[key] = maskEmail(value);
      } else if (lowerKey === 'phone' || lowerKey === 'mobile') {
        masked[key] = maskPhone(value);
      } else if (lowerKey === 'name') {
        masked[key] = maskName(value);
      } else if (lowerKey === 'aadhaar' || lowerKey === 'aadhar') {
        masked[key] = maskAadhaar(value);
      } else {
        masked[key] = value;
      }
    } else {
      masked[key] = value;
    }
  }
  return masked as T;
}
