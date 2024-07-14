import { isEditable } from '@testing-library/user-event/dist/utils';
import {signInWithGoogle, signOutGoogle} from '../functions/auth';
import { FcGoogle } from "react-icons/fc";

const UserPage = ({user, setUser}) => {
    let page;
    if(!user){
        page = <>
            <button className="blue-btn" onClick={() => signInWithGoogle(setUser)}><FcGoogle style={{position: "relative", top:"2px"}}/> Log In</button>
          </>
    }else{
        page = <>
            <button className='red-btn' onClick={() => signOutGoogle(setUser)}>Log Out</button>
        </>
    }
    return page;
    
}

export default UserPage;