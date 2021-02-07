import React, { useState, useEffect } from "react";
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

const SupportBadge = ({ name, type }) => (
  <span className={["support-badge", type === 'victory' ? 'support-badge--victory' : "support-badge--concession"].join(' ')}>
    <FontAwesomeIcon icon={faCheckCircle} /> { name ? name : 'Support' }
  </span>
);

export default SupportBadge;