import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserCircle, faCheckCircle, faFlag, faCheckDouble, faArrowAltCircleUp, faArrowAltCircleDown, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';


const Footer = ({ showRulesModal, showNewVictoryModal, showNewConcessionModal, buildSupport, riseUp, unassignedSupport, numberOfPlayers, playerName, canRiseUp, canBuildSupport }) => {

  return (
    <div className="game-screen__footer">
      <ReactTooltip type="light" effect="solid" border="true" borderColor="#111" multiline="true" clickable="true" />
      <div>
        <p style={{ color: unassignedSupport > 0 ? '#00a700' : '#000000' }}><FontAwesomeIcon icon={faCheckCircle} fixedWidth /> {unassignedSupport > 0 ? <span>You have <strong>{unassignedSupport}</strong> Support to assign!</span> : 'You have no Support to assign.'}</p>
      </div>
      <div>
        <button className="button--outline" onClick={showNewVictoryModal} data-tip="Click to record a victory your movement has won. You need to do this at the start of the game. Write your Victory as a statement (eg. “We have seized a pharmacy so we have ample medical supplies”).">
          <FontAwesomeIcon icon={faArrowAltCircleUp} /> New Victory
        </button>
        <button className="button--outline" disabled={!canBuildSupport} onClick={() => buildSupport(playerName)} data-tip="Build Support as the action for your turn. Select 2 Victories and tell a story about how they interact in a positive, powerful or meaningful way. This gives you a chance to gain more Support which you can then redistribute as you choose. Victories with Support from more of the players have a greater chance of successfully generating additional support.">
          <FontAwesomeIcon icon={faCheckDouble} /> Build Support
        </button>
        <button className="button--outline"  onClick={showRulesModal}>
          <FontAwesomeIcon icon={faQuestionCircle} /> Rules and Hints
        </button>
        <button className="button--outline" disabled={!canRiseUp} onClick={() => riseUp(playerName)} data-tip="Rise Up as the action for your turn. Select 1 Victory and 1 Concession and tell a story about how you will take advantage of the Victory in order to overcome the Concession. Ask your fellow players to weigh in on your plan. Depending on the Support assigned to each card you will either Succeed, Fail or create an Ongoing Struggle.">
          <FontAwesomeIcon icon={faFlag} /> Rise Up
        </button>
        <button className="button--outline"  onClick={showNewConcessionModal} data-tip="Click to record a Concession that your movement has had to make. You need to do this at the start of the game. Write the Concession as a statement (eg. “The city authorities are preventing new people from entering our community”).">
          <FontAwesomeIcon icon={faArrowAltCircleDown} /> New Concession
        </button>
      </div>
      <div>
        <p><FontAwesomeIcon icon={faUserCircle} fixedWidth /> Playing as <strong>{playerName ? playerName : '...'}</strong><br/>
        <FontAwesomeIcon icon={faUsers} fixedWidth /> {numberOfPlayers > 0 ? <span>{numberOfPlayers} {numberOfPlayers > 1 ? 'players' : 'player'} in game</span> : <span>No players in game</span>}</p>
      </div>
    </div>
  );
}

export default Footer;