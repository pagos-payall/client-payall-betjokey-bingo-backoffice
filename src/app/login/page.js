'use client';
import { useState } from 'react';
import LoginForm from '@/components/login';
import RecoveryPassword from '@/components/login/RecoveryPassword';
import { IconComponent } from '@/components/SubHeaderBar';
import { closeIcon } from '@/data/icons';
const LoginPage = () => {
	const [loginView, setLoginView] = useState(true);

	return (
		<>
			{loginView ? (
				<LoginForm />
			) : (
				<div
					style={{
						position: 'absolute',
						right: 30,
						top: 30,
					}}
				>
					<IconComponent
						url={closeIcon}
						size={20}
						onClick={() => setLoginView(true)}
					/>
				</div>
			)}
			<RecoveryPassword setView={setLoginView} view={loginView} />
		</>
	);
};

export default LoginPage;
