import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
import Lobby from './Screens/Lobby';
import CharacterPicker from './Screens/CharacterPicker';
import Game from './Screens/Game';

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/create-character/:roomName">
          <CharacterPicker />
        </Route>
        <Route path="/game/:roomName">
          <Game />
        </Route>
        <Route path="/">
          <Lobby />
        </Route>
      </Switch>
    </BrowserRouter>
  )
};

export default Router;