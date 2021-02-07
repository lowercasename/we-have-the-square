import React, { useState, useEffect } from "react";
import SupportBadge from './SupportBadge';
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faMinusCircle, faMousePointer } from '@fortawesome/free-solid-svg-icons'

const StruggleCard = ({ type, victory, concession, selected, changeCardSelectionState, addSupport, removeSupport, cardId, playerName, unassignedSupport }) => {
  const hasAssignedSupport = victory.support && victory.support[playerName] > 0 ? true : false;
  return (
    <div className={['card card--struggle', selected ? 'selected' : ''].join(' ')}>
      <div className="card--struggle__victory">
        <p>{victory.text}</p>
        <div className="card__support">
          {victory.support && Object.keys(victory.support).map(playerName => (
            [...Array(victory.support[playerName])].map((e, i) => <SupportBadge key={i} type="victory" name={playerName} />)
          ))}
        </div>
      </div>
      <div className="card--struggle__concession">
        <p>{concession.text}</p>
        <div className="card__support">
          {concession.support && 
            [...Array(concession.support)].map((e, i) => <SupportBadge key={i} type="concession" />)
          }
        </div>
      </div>
      <div className="card__toolbar">
        <button className="button--solid" onClick={() => changeCardSelectionState('struggles', cardId)}>
          <FontAwesomeIcon icon={faMousePointer} /> {selected ? 'Unselect' : 'Select'}
        </button>
      </div>
    </div>
  );
};

export default StruggleCard;