import React, { useState, useEffect } from "react";
import SupportBadge from './SupportBadge';
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faMinusCircle, faMousePointer } from '@fortawesome/free-solid-svg-icons'

const Card = ({ type, text, selected, support, changeCardSelectionState, addSupport, removeSupport, cardId, playerName, unassignedSupport, hideToolbar }) => {
  const hasAssignedSupport = support && support[playerName] > 0 ? true : false;
  return (
    <div className={['card', type === 'victory' ? 'card--victory' : 'card--concession', selected ? 'selected' : ''].join(' ')}>
      <p>{text}</p>
      {type === 'victory' &&
        <div className="card__support">
          {support && Object.keys(support).map(playerName => (
            [...Array(support[playerName])].map((e, i) => <SupportBadge key={i} type="victory" name={playerName} />)
          ))}
        </div>
      }
      { !hideToolbar &&
        <div className="card__toolbar">
          <button className="button--solid" onClick={() => changeCardSelectionState(type === 'victory' ? 'victories' : 'concessions', cardId)}>
            <FontAwesomeIcon icon={faMousePointer} /> {selected ? 'Unselect' : 'Select'}
          </button>
          {type === 'victory' &&
            <>
              <button className="button--solid" onClick={() => addSupport(cardId, playerName)} disabled={unassignedSupport <= 0 ? true : false}>
                <FontAwesomeIcon icon={faPlusCircle} /> Add Support
          </button>
              <button className="button--solid" onClick={() => removeSupport(cardId, playerName)} disabled={hasAssignedSupport ? false : true}>
                <FontAwesomeIcon icon={faMinusCircle} /> Remove Support
          </button>
            </>
          }
        </div>
      }
    </div>
  );
};

export default Card;