import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";


const ListElement = ({listas, lista, onClickEvent, isPlaying, setShowDetailedInfo}) => {
    return (
        <div className={isPlaying ? "listElement listElementPlaying" : "listElement"} onClick = {() => setShowDetailedInfo(lista)}>
            <p className="listName">{lista}</p>
            <p className="numberSongs">{Object.keys(listas[lista]).length} canciones</p>
            {isPlaying ? <FaPauseCircle  onClick = {onClickEvent} size={25} className="listControlIcon"></FaPauseCircle> : <FaPlayCircle size={25}  onClick = {onClickEvent} className="listControlIcon"></FaPlayCircle>}
        </div>
    )
}

export default ListElement;