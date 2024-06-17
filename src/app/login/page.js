'use client';
import { useState } from 'react';
import LoginForm from '@/components/login';
import RecoveryPassword from '@/components/login/RecoveryPassword';

const LoginPage = () => {
	const [loginView, setLoginView] = useState(true);

	return (
		<>
			{loginView && <LoginForm />}
			<RecoveryPassword setView={setLoginView} view={loginView} />
		</>
	);
};

export default LoginPage;
