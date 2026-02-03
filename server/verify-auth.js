const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log('--- Starting Auth Verification ---');
    console.log(`Using email: ${email}`);

    try {
        // 1. Register
        console.log('\n1. Testing Registration...');
        let res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        let data = await res.json();

        if (!res.ok) throw new Error(`Registration failed: ${JSON.stringify(data)}`);
        console.log('✅ Registration User Response:', data);

        // 2. Login
        console.log('\n2. Testing Login...');
        res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        data = await res.json();

        if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(data)}`);
        console.log('✅ Login Response:', data);

        const token = data.token;
        if (!token) throw new Error('No token received');

        // 3. Forgot Password
        console.log('\n3. Testing Forgot Password...');
        res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        data = await res.json();

        if (!res.ok) throw new Error(`Forgot Password failed: ${JSON.stringify(data)}`);
        console.log('✅ Forgot Password Response:', data);

        console.log('\n--- Verification POST COMPLETE ---');
        console.log('Check server terminal for [DEV] Reset Link log.');

    } catch (err) {
        console.error('❌ Verification Failed:', err);
        // process.exit(1); 
    }
};

testAuth();
