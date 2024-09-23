import {signOutGoogle} from '../functions/auth';
import LogInButton from './LogInButton';

const UserPage = ({user, setUser}) => {
    let page;
    if(!user){
        page = <>
            <LogInButton setUser={setUser}></LogInButton>
          </>
    }else{
        page = <>
            <button className='red-btn' onClick={() => signOutGoogle(setUser)}>Log Out</button>
        </>
    }
    return page;
    
}

export default UserPage;