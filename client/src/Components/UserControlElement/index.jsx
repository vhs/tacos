import { Button } from 'react-bootstrap'

import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'

const UserControlElement = (props) => {
    const { user, mutateSession } = useAuthentication()

    const doLogout = async () => {
        if (window.confirm('Are you sure?')) {
            const response = await fetch('/auth/logout')

            if (response.ok) mutateSession()

            return response
        }
    }

    return (
        <>
            Signed in as:{' '}
            <b>
                <i>{user.username}</i>
            </b>
            {user.administrator ? ' (Admin)' : ''}&nbsp;
            <Button className='btn-sm fill-out' onClick={() => doLogout()}>
                Logout
            </Button>
        </>
    )
}

export default UserControlElement
