require("dotenv").config();

const testLogin = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "farmer1@test.com",
                password: "123456"
            })
        });

        const data = await response.json();

        console.log("Login API status:", response.status);
        console.log("Login API response:", data);

        if (response.ok) {
            console.log("Login test passed.");
        } else {
            console.log("Login test failed.");
            process.exitCode = 1;
        }

    } catch (error) {
        console.error("Login test error:", error.message);
        process.exitCode = 1;
    }
};

testLogin();
