import { FaPlayCircle, FaPauseCircle, FaRegTrashAlt } from "react-icons/fa";
import { deleteList } from "../functions/getListas";

const ListElement = ({listas, lista, onClickEvent, isPlaying, setShowDetailedInfo, setForceUpdate, user}) => {
    return (
        <div className={isPlaying ? "listElement listElementPlaying" : "listElement"} onClick = {() => setShowDetailedInfo(lista)}>
            <p className="listName">{lista}</p>
            <p className="numberSongs">{Object.keys(listas[lista]).length} canciones</p>

            <FaRegTrashAlt className="listDeleteList delete" onClick={(e) => {deleteList(lista, listas, user);e.stopPropagation();setForceUpdate(1)}}></FaRegTrashAlt>
            {isPlaying ? <FaPauseCircle  onClick = {onClickEvent} size={25} className="listControlIcon"></FaPauseCircle> : <FaPlayCircle size={25}  onClick = {onClickEvent} className="listControlIcon"></FaPlayCircle>}

        </div>
    )
}

export default ListElement;