import React, { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import Modal from 'react-modal';
import '../../css/normalize.css';
import '../../css/grid.css';
import '../../css/style.scss';
import firebase from '../../config/firebase';
import Card from '../Components/Card';
import StruggleCard from '../Components/StruggleCard';
import Footer from '../Components/Footer';

Modal.setAppElement('#root');

Modal.defaultStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0, 0.65)'
  },
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '620px',
    maxHeight: '90%',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #dadada',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
    outline: 'none',
    padding: '20px'
  }
}

const Game = () => {
  const route = useParams();
  const history = useHistory();
  const [room, setRoom] = useState({})
  const [player, setPlayer] = useState('');
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [newVictoryModalVisible, setNewVictoryModalVisible] = useState(false);
  const [newConcessionModalVisible, setNewConcessionModalVisible] = useState(false);
  const [buildSupportResultModalVisible, setBuildSupportResultModalVisible] = useState(false);
  const [riseUpResultModalVisible, setRiseUpResultModalVisible] = useState(false);
  const [newVictoryText, setNewVictoryText] = useState('');
  const [newConcessionText, setNewConcessionText] = useState('');
  const [fragmentedConcessionText, setFragmentedConcessionText] = useState('');
  const [selectedVictories, setSelectedVictories] = useState([]);
  const [selectedConcessions, setSelectedConcessions] = useState([]);
  const [selectedStruggles, setSelectedStruggles] = useState([]);

  useEffect(() => {
    console.log('Let\'s go!');
    if (!localStorage.getItem(route.roomName)) {
      history.push('/create-character/' + route.roomName);
    }
    const roomRef = firebase.database().ref('rooms/' + route.roomName);
    roomRef.on('value', (snapshot) => {
      const room = snapshot.val();
      // console.log(room);
      setRoom(room);
      setPlayer(localStorage.getItem(room.name));
      setSelectedVictories(room.victories ? Object.keys(room.victories).filter((key) => room.victories[key].selected === true) : []);
      setSelectedConcessions(room.concessions ? Object.keys(room.concessions).filter((key) => room.concessions[key].selected === true) : []);
      setSelectedStruggles(room.struggles ? Object.keys(room.struggles).filter((key) => room.struggles[key].selected === true) : []);
      if (room.buildSupportResultModal && room.buildSupportResultModal.visible) {
        setBuildSupportResultModalVisible(true);
      } else {
        setBuildSupportResultModalVisible(false);
      }
      if (room.riseUpResultModal && room.riseUpResultModal.visible) {
        setRiseUpResultModalVisible(true);
      } else {
        setRiseUpResultModalVisible(false);
      }
    });
  }, []);

  const createVictory = () => {
    if (newVictoryText !== '') {
      const victory = {
        text: newVictoryText
      }
      const victoriesRef = firebase.database().ref('rooms/' + route.roomName + '/victories');
      victoriesRef.push(victory);
      setNewVictoryText('');
      setNewVictoryModalVisible(false);
      closeRiseUpModal();
    }
  }

  const createConcession = () => {
    if (newConcessionText !== '') {
      const concession = {
        text: newConcessionText,
        // Each Concession is assigned support in a range between 1 and the number of players
        // (because each player gets 2 Support at the beginning of the game)
        // 2 players = 2 victories, 2 concessions, 4 total victory support and 2-4 total concession support
        // 3 players = 3 victories, 3 concessions, 6 total victory support and 3-9 total concession support
        // 4 players = 4 victories, 4 concessions, 8 total victory support and 4-16 total concession support
        support: Math.floor(Math.random() * (Object.keys(room.players).length)) + 1
      }
      const concessionsRef = firebase.database().ref('rooms/' + route.roomName + '/concessions');
      concessionsRef.push(concession);
      setNewConcessionText('');
      setNewConcessionModalVisible(false);
    }
  }

  const changeCardSelectionState = (cardType, cardId) => {
    firebase.database().ref('rooms/' + route.roomName + '/' + cardType + '/' + cardId).once('value').then((snapshot) => {
      const card = snapshot.val();
      card.selected = !card.selected;
      firebase.database().ref('rooms/' + route.roomName + '/' + cardType + '/' + cardId).set(card);
    });
  }

  const createFragmentedConcession = (concessionCardId, concessionCard) => {
    console.log(concessionCardId, concessionCard);
    if (fragmentedConcessionText !== '') {
      const newConcession = {
        text: fragmentedConcessionText,
        // The new concession gets the 'lesser half'
        support: Math.floor(concessionCard.support / 2)
      }
      firebase.database().ref('rooms/' + route.roomName + '/concessions').push(newConcession);
      // The original concession gets the 'greater half'
      firebase.database().ref('rooms/' + route.roomName + '/concessions/' + concessionCardId + '/support').set(Math.floor(concessionCard.support / 2) + (concessionCard.support % 2));
      setFragmentedConcessionText('');
      closeRiseUpModal();
    }
  }

  const createStruggle = (cards) => {
    console.log('Creating struggle!');
    console.log(cards);
    firebase.database().ref('rooms/' + route.roomName + '/struggles').push(cards);
    firebase.database().ref('rooms/' + route.roomName + '/victories/' + cards.victoryCardId).remove();
    firebase.database().ref('rooms/' + route.roomName + '/concessions/' + cards.concessionCardId).remove();
    closeRiseUpModal();
  }

  const addSupport = (cardId, playerName, cardType) => {
    firebase.database().ref('rooms/' + route.roomName + '/victories/' + cardId).once('value').then((snapshot) => {
      const card = snapshot.val();
      // Does the card have any support at all?
      if (card.support) {
        // Does the card have support from the current player?
        if (Object.keys(card.support).some(v => v === playerName)) {
          // Increment that support
          card.support[playerName]++;
        } else {
          // Add a new support object from the current player
          card.support[playerName] = 1;
        }
      } else {
        // Add a new support object from the current player
        card.support = {};
        card.support[playerName] = 1;
      }
      firebase.database().ref('rooms/' + route.roomName + '/victories/' + cardId).set(card);
    });
    firebase.database().ref('rooms/' + route.roomName + '/players/' + playerName + '/unassignedSupport').set(room['players'][player]['unassignedSupport'] - 1);
  }

  const removeSupport = (cardId, playerName, cardType) => {
    firebase.database().ref('rooms/' + route.roomName + '/victories/' + cardId).once('value').then((snapshot) => {
      const card = snapshot.val();
      // Does the card have support from the current player?
      if (Object.keys(card.support).some(v => v === playerName)) {
        // Decrement that support
        card.support[playerName]--;
      }
      // Remove 0-support key-value pairs
      if (card.support[playerName] <= 0) {
        delete card.support[playerName];
      }
      firebase.database().ref('rooms/' + route.roomName + '/victories/' + cardId).set(card);
    });
    firebase.database().ref('rooms/' + route.roomName + '/players/' + playerName + '/unassignedSupport').set(room['players'][player]['unassignedSupport'] + 1);
  }

  const buildSupport = (playerName) => {
    let runAction = selectedVictories.every(card => room.victories[card].support);
    if (runAction) {
      let supportRecord = {};
      console.log("Running Build Support");
      // For each Victory selected...
      selectedVictories.forEach(card => {
        console.log('Card', card);
        // What percentage of the players support this Victory - the more players support, the more likely
        // it is to build more support
        let maximumBuildChance = (Object.keys(room.victories[card].support).length / Object.keys(room.players).length) * 100;
        maximumBuildChance = maximumBuildChance > 85 ? 85 : maximumBuildChance;
        console.log('Maximum build chance:', maximumBuildChance);
        // For each player who supports this Victory...
        Object.keys(room.victories[card].support).forEach(support => {
          console.log('Player', support);
          // This is how much support from this player the card started with
          let originalSupport = room.victories[card].support[support];
          // let revisedSupport = room.victories[card].support[support];
          // For each point that this player supports this Victory...
          for (let i = 0; i < originalSupport; i++) {
            console.log('Run', i);
            // Inject some randomness: the actual build chance is 50% of the maximum build chance plus
            // a random value between that value and the maximum build chance value.
            // let halfMax = maximumBuildChance / 2;
            // let buildChance = Math.floor(Math.random() * (maximumBuildChance - halfMax + 1) + halfMax);
            // console.log('Actual build chance', buildChance)
            let randomRoll = Math.floor(Math.random() * 100) + 1;
            console.log('Random roll', randomRoll);
            if (randomRoll <= maximumBuildChance) {
              console.log('Success!');
              // Add a Support!
              supportRecord[support] = supportRecord[support] ? supportRecord[support] + 1 : 1;
            } else {
              console.log('Failure!');
            }
          }
        });
      });
      console.log("Support record:", supportRecord);
      // Finally, write to the database!
      firebase.database().ref('rooms/' + route.roomName + '/players').once('value').then((snapshot) => {
        const players = snapshot.val();
        Object.keys(players).forEach(player => {
          if (supportRecord[player]) {
            players[player].unassignedSupport = players[player].unassignedSupport + supportRecord[player]
          }
        });
        firebase.database().ref('rooms/' + route.roomName + '/players').set(players);
      });
      const modal = {
        visible: true,
        name: playerName,
        supportRecord: supportRecord
      }
      firebase.database().ref('rooms/' + route.roomName + '/buildSupportResultModal').set(modal);
    } else {
      alert("You cannot Build Support with a card that has no Support tokens on it!");
    }
  }

  const riseUp = (playerName) => {
    let maxUs = 0;
    let maxThem = 0;
    let usRoll = 0;
    let themRoll = 0;
    let modal = {};
    let target;
    if (selectedConcessions.length === 1) {
      // The target is a Concession
      target = "concession";
      Object.entries(room.victories[selectedVictories[0]].support).forEach(support => maxUs = maxUs + support[1]);
      maxThem = room.concessions[selectedConcessions[0]].support;
      // Each side rolls a random number up to the total number of Support on each card.
      usRoll = Math.floor(Math.random() * maxUs) + 1;
      themRoll = Math.floor(Math.random() * maxThem) + 1;
    } else if (selectedStruggles.length === 1) {
      // The target is a struggle
      target = "struggle";
      // Add the points on the Victory card
      Object.entries(room.victories[selectedVictories[0]].support).forEach(support => maxUs = maxUs + support[1]);
      // Add the points on the Struggle card
      Object.entries(room.struggles[selectedStruggles[0]].victory.support).forEach(support => maxUs = maxUs + support[1]);
      // Calculate the Concession side
      maxThem = room.struggles[selectedStruggles[0]].concession.support;
      // Here we don't roll random dice - the result is a simple calculation
      usRoll = maxUs;
      themRoll = maxThem;
    }
    console.log("Running Rise Up");
    console.log("Target", target);
    console.log("Maximum Us roll", maxUs);
    console.log("Maximum Them roll", maxThem);
    console.log("Actual Us roll", usRoll);
    console.log("Actual Them roll", themRoll);
    // Now send out the modals and deal out the results
    if (target === "concession") {
      if (usRoll > themRoll) {
        // Success
        console.log("Success!");
        modal = {
          visible: true,
          result: 'success',
          name: playerName,
        }
        // Delete the destroyed Concession
        firebase.database().ref('rooms/' + route.roomName + '/concessions/' + selectedConcessions[0]).remove();
      } else if (usRoll === themRoll) {
        // Mitigated success
        console.log("Mitigated success!");
        modal = {
          visible: true,
          result: 'mitigatedSuccess',
          name: playerName,
        }
        // Create the Struggle joint card
        createStruggle({
          victoryCardId: selectedVictories[0],
          concessionCardId: selectedConcessions[0],
          victory: room.victories[selectedVictories[0]],
          concession: room.concessions[selectedConcessions[0]]
        })
      } else if (usRoll < themRoll) {
        // Failure
        console.log("Failure!");
        modal = {
          visible: true,
          result: 'failure',
          name: playerName,
          concessionCard: room.concessions[selectedConcessions[0]],
          concessionCardId: selectedConcessions[0],
        }
      }
    } else if (target === "struggle") {
      // If the struggle is a success, the ongoing struggle is split up and the concession is destroyed
      // On equal scores, the Us side still win
      if (usRoll >= themRoll) {
        // Success
        modal = {
          visible: true,
          result: 'success',
          name: playerName,
        }
        splitStruggle();
      } else {
        // If the struggle is a failure, nothing changes.
        modal = {
          visible: true,
          result: 'failure',
          name: playerName
        }
      }
    }
    // Add the target to the modal we're about to show
    modal.target = target;
    firebase.database().ref('rooms/' + route.roomName + '/riseUpResultModal').set(modal);
  }

  const splitStruggle = () => {
    let struggle = room.struggles[selectedStruggles[0]];
    const victory = {
      text: struggle.victory.text,
      support: struggle.victory.support
    }
    // Return the victory
    firebase.database().ref('rooms/' + route.roomName + '/victories').push(victory);
    // Delete the struggle
    firebase.database().ref('rooms/' + route.roomName + '/struggles/' + selectedStruggles[0]).remove();
  }

  const closeSupportModal = () => {
    firebase.database().ref('rooms/' + route.roomName + '/buildSupportResultModal/visible').set(false);
  }

  const closeRiseUpModal = () => {
    firebase.database().ref('rooms/' + route.roomName + '/riseUpResultModal/visible').set(false);
  }

  return (
    <>
      <Modal
        isOpen={rulesModalVisible}
        onRequestClose={() => setRulesModalVisible(false)}
        contentLabel="Rules modal"
      >
        <div className="row">
          <div className="col-xs-12 modal__body">
            <h2>Rules and Hints</h2>
            <p>We Have the Square is played in three phases. You can continue playing for as long as you like but every game should involve all players getting a turn in Phase Three.</p>
            <h3 id="phase-one-create-the-community">Phase One: Create the Community</h3>
            <p>In this phase <strong>each player</strong> should create 1 <strong>New Victory</strong> and 1 <strong>New Concession</strong> by clicking on the buttons at the bottom of the screen. Victories and Concessions can be large or small, material or immaterial. Perhaps your movement has claimed a key piece of city infrastructure? Or maybe you have devised an innovative means of conflict resolution? On the other hand, perhaps you have had to make an alliance with a group you are uneasy about? Or alienated part of your community? Write each Victory or Concession as a short statement (eg. “We are operating a vegan kitchen which is successfully catering to our entire community”).</p>
            <p><em><strong>Hint:</strong> These victories and concessions form the outline of your community. Don’t worry about whether your proposals are too modest or too grand, or if they conflict with someone else’s statements. The game allows you to build on modest victories, step back from overblown ones and work to resolve your community’s different perceptions of the movement. Don’t talk too much about the movement before writing, just get your suggestions down. There are no wrong answers here!</em></p>
            <h3 id="phase-two-assign-support">Phase Two: Assign Support</h3>
            <p>Each player starts the game with 2 <strong>Support tokens</strong>. In this phase, assign support to the Victories you think the movement should be focusing on. Maybe you want to focus all your energy on a single front? Or maybe you think it’s important to spread your support out evenly?</p>
            <p><em><strong>Hint:</strong> Do not worry about discussing this too much before assigning support. You will have opportunities to discuss priorities with other players, and redistribute support accordingly, later on.</em></p>
            <p><em>When the Concessions were created, Support was secretly assigned to them. You will not be able to see how much support there is behind a given Concession unless it becomes part of an <strong>Ongoing Struggle</strong> (see below).</em></p>
            <h3 id="phase-three-grow-the-community">Phase Three: Grow the Community</h3>
            <p>Beginning with the player who most recently cooked a hot meal for someone else, you now take it in turns to perform one of two possible actions.</p>
            <h4 id="action-one-build-support">Action One: Build Support</h4>
            <p>Select <strong>two Victories</strong> and tell a story about how they interact in a positive, powerful or meaningful way. Then click the <strong>Build Support</strong> button to see the response! This gives you a chance to gain additional Support tokens which you can then redistribute as you choose. Victories with support from more of the players have a greater chance of successfully generating additional support than Victories with support from only one player.</p>
            <h4 id="action-two-rise-up">Action Two: Rise Up</h4>
            <p>Select <strong>one Victory</strong> and <strong>one Concession or Ongoing Struggle</strong>. Then, tell a story about how your community is going to take advantage of this Victory in order to overcome the Concession. Ask your fellow players to weigh in on your plan in order to create the best possible solution. Then click the <strong>Rise Up</strong> button to see the result!  Depending on the support assigned to each card you will either <strong>Succeed</strong>, <strong>Fail</strong> or create an <strong>Ongoing Struggle</strong>.</p>
            <ul>
              <li>If you <strong>Succeed</strong>, your plan worked! This Concession disappears and you are given an opportunity to write a new Victory.</li>
              <li>If you <strong>Fail</strong>, your strategy was unsuccessful because you failed to account for an important factor. Work out with your fellow players what this factor was, and record it as a new Concession. Because you have learned so much in this attempt, the Support for the Concession you were attempting to overcome is now fragmented between it and the new Concession, making both easier to tackle in future.</li>
              <li>If you neither Succeed nor Fail, an <strong>Ongoing Struggle</strong> will form, binding the Victory and Concession together. You cannot Build Support with this card or use it to Rise Up until the Struggle is resolved. However, you will now be able to see how much Support there is behind the Concession and use this information to leverage another Victory in order to resolve the struggle.</li>
            </ul>
            <hr />
            <p><em><strong>Hint:</strong> As a general rule, when storytelling do not contradict each other’s statements but instead adopt a “yes, and…” model where you add to one another’s inventions. Perhaps your square will become a science-fictional world which bends the rules of what we think of as reality. That’s totally fine! We conceive of this game as an example of what <a href="http://adriennemareebrown.net/">adrienne maree brown</a> calls “collective ideation”. As she puts it: “if we want a world that works for more people, we have to get into the practice of ideating together, letting others as close as possible into the intimate space where ideas are born.”</em></p>
          </div>
          <div className="col-xs-12 modal__footer">
            <button onClick={() => setRulesModalVisible(false)}>Close</button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={newVictoryModalVisible}
        onRequestClose={() => setNewVictoryModalVisible(false)}
        contentLabel="Create New Victory modal"
      >
        <div className="row">
          <div className="col-xs-12 modal__body">
            <h2>Record New Victory</h2>
            <p>Record a victory your movement has won. Victories can be large or small, material or immaterial. Perhaps your movement has claimed a key piece of city infrastructure? Or maybe you have devised an innovative means of conflict resolution? Write the victory as a short statement (eg. “We have enough accomodation to safely house everyone in our community”).</p>
            <textarea
              placeholder="Describe your victory."
              value={newVictoryText}
              onChange={e => setNewVictoryText(e.target.value)}
            />
          </div>
          <div className="col-xs-12 modal__footer">
            <button onClick={() => setNewVictoryModalVisible(false)}>Cancel</button>
            <button onClick={createVictory}>Create Victory</button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={newConcessionModalVisible}
        onRequestClose={() => setNewConcessionModalVisible(false)}
        contentLabel="Create New Concession modal"
      >
        <div className="row">
          <div className="col-xs-12 modal__body">
            <h2>Record New Concession</h2>
            <p>Record a concession your movement has had to make. Concessions can be large or small, material or immaterial. Perhaps you have had to make an alliance with a group you are uneasy about? Or alienated part of your community? Write the concession as a short statement (eg. “The city authorities are preventing new people from entering our community”).</p>
            <textarea
              placeholder="Describe your concession."
              value={newConcessionText}
              onChange={e => setNewConcessionText(e.target.value)}
            />
          </div>
          <div className="col-xs-12 modal__footer">
            <button onClick={() => setNewConcessionModalVisible(false)}>Cancel</button>
            <button onClick={createConcession}>Create Concession</button>
          </div>
        </div>
      </Modal>
      {room.buildSupportResultModal &&
        <Modal
          isOpen={buildSupportResultModalVisible}
          onRequestClose={closeSupportModal}
          contentLabel="Build Support result modal"
        >
          <div className="row">
            <div className="col-xs-12 modal__body">
              <h2>{room.buildSupportResultModal.supportRecord ? 'Good news!' : 'Bad news!'}</h2>
              {room.buildSupportResultModal.supportRecord ?
                <>
                  <p>In uniting the energies of two separate Victories, {room.buildSupportResultModal.name} has built new support for your cause:</p>
                  <ul>
                    {Object.keys(room.buildSupportResultModal.supportRecord).map(name => (
                      <li><strong>{room.buildSupportResultModal.supportRecord[name]}</strong> Support for <strong>{name}</strong></li>
                    ))}
                  </ul>
                  <p>You can now all redistribute your Support.</p>
                </>
                :
                <p>Despite their best efforts, {room.buildSupportResultModal.name} failed to build new support for your cause.</p>
              }
            </div>
            <div className="col-xs-12 modal__footer">
              <button onClick={closeSupportModal}>Close</button>
            </div>
          </div>
        </Modal>
      }
      {room.riseUpResultModal &&
        <Modal
          isOpen={riseUpResultModalVisible}
          onRequestClose={() => false}
          contentLabel="Rise Up result modal"
        >
          <div className="row">
            <div className="col-xs-12 modal__body">
              <h2>{room.riseUpResultModal.result === 'success' ? 'Wonderful news!' : 'A new development!'}</h2>
              {room.riseUpResultModal.target === 'concession' &&
                <>
                  {room.riseUpResultModal.result === 'success' &&
                    <>
                      <p><strong>{room.riseUpResultModal.name}</strong> has lead your movement in a successful action! The Concession against which you rose is no more. <strong>{room.riseUpResultModal.name}</strong>, with the help of the others, describe the new Victory that has been claimed as a result of this action.</p>
                      {player === room.riseUpResultModal.name &&
                        <textarea
                          style={{ margin: '0 0 1rem 0' }}
                          placeholder="Describe this victory."
                          value={newVictoryText}
                          onChange={e => setNewVictoryText(e.target.value)}
                        />
                      }
                      <p>You can now all redistribute your Support in light of this new triumph.</p>
                    </>
                  }
                  {room.riseUpResultModal.result === 'mitigatedSuccess' &&
                    <>
                      <p><strong>{room.riseUpResultModal.name}</strong> has embarked your movement on an Ongoing Struggle. This Victory and Concession are now locked together until the struggle is resolved. You cannot use the Victory to Build Support, nor can you reassign Support to or from it. However, you have learned how much support there is behind this Concession, and you can use another Victory to resolve this struggle.</p>
                      <p>You can now all redistribute your Support in light of this new development.</p>
                    </>
                  }
                  {room.riseUpResultModal.result === 'failure' &&
                    <>
                      <p><strong>{room.riseUpResultModal.name}</strong> was unsuccessful in their action. Your strategy was unsuccessful because you failed to account for an important factor. Work out together what this factor was, and record it as a new Concession.</p>
                      {player === room.riseUpResultModal.name &&
                        <textarea
                          style={{ margin: '0 0 1rem 0' }}
                          placeholder="Describe this concession."
                          value={fragmentedConcessionText}
                          onChange={e => setFragmentedConcessionText(e.target.value)}
                        />
                      }
                      <p>Don’t despair though! You have all learned a lot in the process, so the Support for the Concession you were attempting to overcome is now fragmented between it and the new Concession, making both easier to tackle in future.</p>
                      <p>You can now all redistribute your Support in light of this new development.</p>
                    </>
                  }
                </>
              }
              {room.riseUpResultModal.target === 'struggle' &&
                <>
                  {room.riseUpResultModal.result === 'success' &&
                    <>
                      <p><strong>{room.riseUpResultModal.name}</strong> has lead your movement in a successful action! The Ongoing Struggle in which your movement has been engaged has come to an end. <strong>{room.riseUpResultModal.name}</strong>, with the help of the others, describe the new Victory that has been claimed as a result of this action.</p>
                      {player === room.riseUpResultModal.name &&
                        <textarea
                          style={{ margin: '0 0 1rem 0' }}
                          placeholder="Describe this victory."
                          value={newVictoryText}
                          onChange={e => setNewVictoryText(e.target.value)}
                        />
                      }
                      <p>You can now all redistribute your Support in light of this new development.</p>
                    </>
                  }
                  {room.riseUpResultModal.result === 'failure' &&
                    <p>Hey <strong>{room.riseUpResultModal.name}</strong>, don't try to join an ongoing struggle with underpowered forces when you know your attempt will end in failure! Don't do it! Our movement needs level heads!</p>
                  }
                </>
              }
            </div>
            <div className="col-xs-12 modal__footer">
              {room.riseUpResultModal.target === 'concession' &&
                <>
                  {room.riseUpResultModal.result === 'mitigatedSuccess' &&
                    <button onClick={() => closeRiseUpModal()}>Close</button>
                  }
                  {room.riseUpResultModal.result === 'success' &&
                    <>
                      {player === room.riseUpResultModal.name ?
                        <button onClick={createVictory}>Create Victory</button>
                        :
                        <p style={{ color: 'silver', display: 'block', margin: '0 auto' }}>This message will close when <strong>{room.riseUpResultModal.name}</strong> creates their Victory</p>
                      }
                    </>
                  }
                  {room.riseUpResultModal.result === 'failure' &&
                    <>
                      {player === room.riseUpResultModal.name ?
                        <button onClick={() => createFragmentedConcession(room.riseUpResultModal.concessionCardId, room.riseUpResultModal.concessionCard)}>Create Concession</button>
                        :
                        <p style={{ color: 'silver', display: 'block', margin: '0 auto' }}>This message will close when <strong>{room.riseUpResultModal.name}</strong> creates their Concession</p>
                      }
                    </>
                  }
                </>
              }
              {room.riseUpResultModal.target === 'struggle' &&
                <>
                  {room.riseUpResultModal.result === 'success' &&
                    <button onClick={createVictory}>Create Victory</button>
                  }
                  {room.riseUpResultModal.result === 'failure' &&
                    <button onClick={() => closeRiseUpModal()}>Close</button>
                  }
                </>
              }
            </div>
          </div>
        </Modal>
      }
      <div className="game-screen">
        <div className="row game-screen__main">
          <div className="col-xs-4 game__column" id="col-victories">
            <CSSTransitionGroup
              transitionName="card"
              transitionEnterTimeout={300}
              transitionLeaveTimeout={1000}>
              <h2>Victories</h2>
              {room.victories && Object.keys(room.victories).map(card => (
                <Card
                  key={card}
                  cardId={card}
                  playerName={player}
                  changeCardSelectionState={changeCardSelectionState}
                  addSupport={addSupport}
                  removeSupport={removeSupport}
                  text={room.victories[card].text}
                  support={room.victories[card].support}
                  selected={room.victories[card].selected}
                  type="victory"
                  unassignedSupport={room.players && player ? room['players'][player]['unassignedSupport'] : 0}
                  hideToolbar={room.victories[card].hideToolbar}
                />
              ))}
            </CSSTransitionGroup>
          </div>
          <div className="col-xs-4 game__column" id="col-struggles">
            <h2>Ongoing Struggles</h2>
            <CSSTransitionGroup
              transitionName="card"
              transitionEnterTimeout={300}
              transitionLeaveTimeout={1000}>
              {room.struggles && Object.keys(room.struggles).map(card => (
                <StruggleCard
                  key={card}
                  cardId={card}
                  playerName={player}
                  victory={room.struggles[card].victory}
                  concession={room.struggles[card].concession}
                  selected={room.struggles[card].selected}
                  type="struggle"
                  changeCardSelectionState={changeCardSelectionState}
                  addSupport={addSupport}
                  removeSupport={removeSupport}
                  unassignedSupport={room.players && player ? room['players'][player]['unassignedSupport'] : 0}
                />
              ))}
            </CSSTransitionGroup>
          </div>
          <div className="col-xs-4 game__column" id="col-concessions">
            <h2>Concessions</h2>
            <CSSTransitionGroup
              transitionName="card"
              transitionEnterTimeout={300}
              transitionLeaveTimeout={1000}>
              {room.concessions && Object.keys(room.concessions).map(card => (
                <Card
                  key={card}
                  cardId={card}
                  text={room.concessions[card].text}
                  selected={room.concessions[card].selected}
                  type="concession"
                  changeCardSelectionState={changeCardSelectionState}
                />
              ))}
            </CSSTransitionGroup>
          </div>
        </div>
        <Footer
          roomName={route.roomName}
          unassignedSupport={room.players && player ? room['players'][player]['unassignedSupport'] : 0}
          numberOfPlayers={room.players && Object.keys(room.players).length}
          playerName={player}
          showNewVictoryModal={() => setNewVictoryModalVisible(true)}
          showNewConcessionModal={() => setNewConcessionModalVisible(true)}
          showRulesModal={() => setRulesModalVisible(true)}
          buildSupport={buildSupport}
          riseUp={riseUp}
          canBuildSupport={selectedConcessions.length === 0 && selectedStruggles.length === 0 && selectedVictories.length === 2 ? true : false}
          canRiseUp={
            ((selectedVictories.length === 1 && selectedConcessions.length === 1 && selectedStruggles.length === 0) ||
              (selectedVictories.length === 1 && selectedConcessions.length === 0 && selectedStruggles.length === 1)) &&
            (room.victories && selectedVictories && room.victories[selectedVictories[0]] && room.victories[selectedVictories[0]].support
              ? true : false)
          }
        />
      </div>
    </>
  )
};

export default Game;