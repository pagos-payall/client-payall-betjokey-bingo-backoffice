import UsersContext from '@/context/users/UsersContext';
import { useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function useUser() {
	const { username, jwt, setActUsername } = useContext(UsersContext);
	const router = useRouter();

	const login = useCallback(
		(user, jwt) => {
			setActUsername(user, jwt);
		},
		[setActUsername]
	);

	const logout = useCallback(() => {
		setActUsername('');
		router.push('/');
	}, [setActUsername]);

	return {
		isLogged: Boolean(jwt),
		username,
		login,
		logout,
	};
}
