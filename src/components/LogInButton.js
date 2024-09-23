import { FcGoogle } from "react-icons/fc";
import {signInWithGoogle} from '../functions/auth';

const LogInButton = ({setUser}) => {
    return <button className="blue-btn" onClick={() => signInWithGoogle(setUser)}><FcGoogle style={{position: "relative", top:"2px"}}/> Log In</button>
}
export default LogInButton;