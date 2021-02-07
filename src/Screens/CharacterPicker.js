import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import firebase from '../../config/firebase';


const CharacterPicker = () => {
  const history = useHistory();
  const [characterName, setCharacterName] = useState("");
  const route = useParams();

  useEffect(() => {
    if (localStorage.getItem(route.roomName)) {
      history.push('/game/' + route.roomName);
    }
    const roomRef = firebase.database().ref('rooms/' + route.roomName);
    roomRef.once('value').then((snapshot) => {
      if (!snapshot.val()) {
        history.push('/');
      }
    });
  }, []);

  const changeNameValue = (value) => {
    if (value === "") {
      setCharacterName(value);
    } else {
      let whitelist = /^[a-zA-Z0-9-_ ]+$/;
      if (whitelist.test(value)) {
        setCharacterName(value);
      }
    }
  }

  const enterGame = () => {
    if (characterName !== "") {
      const roomRef = firebase.database().ref('rooms/' + route.roomName);
      roomRef.once('value').then((snapshot) => {
        const room = snapshot.val();
        if (!room.players) {
          room.players = {};
        }
        room.players[characterName] = { unassignedSupport: 2 };
        roomRef.set(room).then(() => {
          localStorage.setItem(route.roomName, characterName);
          history.push('/game/' + route.roomName);
        })
      });
    }
  }

  return (
    <div className="container lobby__container">
      <div className="row">
        <div className="col-sm-12">
          <h1>Create Character</h1>
          <p>
            Enter the name of your character below. You can choose to play as an individual activist or as a revolutionary faction (for example, your character could be called “Pearl” or they could be “The Crystal Gems”). This is also an opportunity to indicate what pronouns your character prefers, which can be done in brackets after their name (for example, “Garnet (she/her)”).
          </p>
          <input
            className="lobby__input"
            type="text"
            placeholder="Type character name"
            value={characterName}
            onChange={(e) => changeNameValue(e.target.value)}
          />
          <button type="button" className="button--outline lobby__button" onClick={enterGame}>
            Enter game
          </button>
        </div>
      </div>
    </div>
  )
};

export default CharacterPicker;