import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { nanoid } from 'nanoid';
import generate from 'project-name-generator';
import firebase from '../../config/firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import '../../css/normalize.css';
import '../../css/style.scss';

const Lobby = () => {
  let history = useHistory();
  const [showNewGameForm, setShowNewGameForm] = useState(false);
  const [showLoadGameForm, setShowLoadGameForm] = useState(false);
  const [newGamePassword, setNewGamePassword] = useState("");
  const [loadGamePassword, setLoadGamePassword] = useState("");
  const [newErrorMessage, setNewErrorMessage] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const createGame = () => {
    if (newGamePassword !== "") {
      setLoading(true);
      const roomsRef = firebase.database().ref('rooms').once('value').then((snapshot) => {
        const allRooms = snapshot.val();
        const matchingRoom = Object.keys(allRooms).some(room => allRooms[room].password === newGamePassword);
        if (matchingRoom) {
          setLoading(false);
          return setNewErrorMessage("A game with this password already exists!");
        }
        const room = {
          password: newGamePassword,
          name: generate().dashed
          // players: {
          //   'Alice': {
          //     unassignedSupport: 2
          //   }
          // }
        };
        const roomRef = firebase.database().ref('rooms/' + room.name);
        roomRef.set(room).then(() => {
          setLoading(false);
          firebase.database().ref('rooms/' + room.name + '/victories').push({ text: 'We have the square.', hideToolbar: true });
          history.push('/create-character/' + room.name);
        });
      });
    }
  }

  const enterGame = () => {
    if (loadGamePassword !== "") {
      setLoading(true);
      const roomsRef = firebase.database().ref('rooms').once('value').then((snapshot) => {
        const allRooms = snapshot.val();
        const matchingRoom = Object.keys(allRooms).find(room => allRooms[room].password === loadGamePassword);
        if (matchingRoom) {
          // Check if this player has a character for this room
          if (localStorage.getItem(allRooms[matchingRoom].name)) {
            setLoading(false);
            history.push('/game/' + allRooms[matchingRoom].name);
          } else {
            // This player needs to create a character
            setLoading(false);
            history.push('/create-character/' + allRooms[matchingRoom].name);
          }
        } else {
          setLoadErrorMessage("Sorry, there's no game matching this password.");
          setLoading(false);
        }
      });
    }
  }

  const changePasswordValue = (location, value) => {
    setLoadErrorMessage(false);
    setNewErrorMessage(false);
    if (value === "") {
      if (location === "newGamePassword") {
        setNewGamePassword(value);
      } else if (location === "loadGamePassword") {
        setLoadGamePassword(value);
      }
    } else {
      let whitelist = /^[a-zA-Z0-9-_]+$/;
      if (whitelist.test(value)) {
        if (location === "newGamePassword") {
          setNewGamePassword(value);
        } else if (location === "loadGamePassword") {
          setLoadGamePassword(value);
        }
      }
    }
  }

  return (
    <div className="container lobby__container">
      <div className="row">
        <div className="col-sm-12">
          <h1>We Have The Square</h1>
          <p style={{ margin: '2rem 0' }}>
            We Have the Square is a storytelling game through which you can imagine revolutionary communities. Inspired by the ghostly possibilities of Maidan, Taksim, Gezi and Zuccotti, by Occupy and the movement for Black lives, we join together to envision what victory might look like.
          </p>
          <p>
            In this game you and your fellow players are a group of activists who have established a revolutionary community in an otherwise hostile city. Along the way you have won victories but you have also had to make concessions. How you build support for your cause and overcome the obstacles still in your path is up to you.
          </p>
          <p>
            We Have the Square is a two to six player game which will take between twenty and forty minutes to play. Before you begin, discuss if there is anything you don’t want to tell stories about - violence, death, fresh defeats and traumas. If a story takes a turn you are uncomfortable with at any time simply type or say “X”. This is a sign for everyone to take a break, go and get a glass of water, and come up with a different way to tell the story.
          </p>
          <p>
            We Have the Square is played on an online gameboard, but does not have a communication function. Before you start playing, come together using a method of communication with which you are all familiar and comfortable, such as instant messenger or an audio or video call. Then one of you should create a new game by entering a password below and sending that password to your fellow players.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12 col-md-6">
          <button type="button" className="button--outline lobby__button" onClick={() => { setShowNewGameForm(true); setShowLoadGameForm(false); }}>
            New Game
          </button>
        </div>
        <div className="col-xs-12 col-md-6">
          <button type="button" className="button--outline lobby__button" onClick={() => { setShowNewGameForm(false); setShowLoadGameForm(true); }}>
            Load Game
          </button>
        </div>
      </div>
      <div className="row">
        {showNewGameForm &&
          <div className="col-xs-12">
            <h2>Create a new game</h2>
            <p style={{ marginBottom: 0 }}>
              Type a password to share with others who will join your game.
            </p>
            <input
              className="lobby__input"
              type="text"
              placeholder="Letters, numbers, hyphen and underscore only"
              value={newGamePassword}
              onChange={(e) => changePasswordValue("newGamePassword", e.target.value)}
            />
            {newErrorMessage &&
              <p style={{ color: 'red', padding: '0 0 2rem 0' }}>{newErrorMessage}</p>
            }
            <button type="button" className="button--outline lobby__button" onClick={createGame}>
              Create Game {loading && <FontAwesomeIcon icon={faSquare} spin />}
            </button>
          </div>
        }
        {showLoadGameForm &&
          <div className="col-xs-12">
            <h2>Enter game password</h2>
            <p style={{ marginBottom: 0 }}>
              Type the password you were given to join an existing game.
            </p>
            <input
              className="lobby__input"
              type="text"
              placeholder="Type password"
              value={loadGamePassword}
              onChange={(e) => changePasswordValue("loadGamePassword", e.target.value)}
            />
            {loadErrorMessage &&
              <p style={{ color: 'red', padding: '0 0 2rem 0' }}>{loadErrorMessage}</p>
            }
            <button type="button" className="button--outline lobby__button" onClick={enterGame}>
              Enter Game {loading && <FontAwesomeIcon icon={faSquare} spin />}
            </button>
          </div>
        }
      </div>
      <div className="row">
        <div className="col-xs-12">
          <p style={{ marginTop: '4rem', textAlign: 'center', color: '#666' }}>
            Created in 2020 by Katie Stone and <a href="https://raphaelkabo.com">Raphael Kabo</a> as an ongoing part of <a href="https://utopia.ac">Utopian Acts</a>.<br/>Version 2.1.
            </p>
        </div>
      </div>
    </div>
  )
};

export default Lobby;