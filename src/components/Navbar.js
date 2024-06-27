import { Children } from 'react';

const Navbar = ({children, setTab}) => {
    return (
        <div className="navbar">
          {Children.map(children, (child, idx) =>
            <div className="Row" onClick={() => setTab(idx)}>
              {child}
            </div>
          )}
        </div>
      );
    // return (
    //     <div className="navbar">
    //         {Children.map(tabs, tab => {
    //             return <div>{tab}</div>
    //         })}
    //     </div>
    // )
}

export default Navbar;