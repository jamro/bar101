import React, { useState, useRef, useEffect } from 'react';
import ConversationText from '../components/chat/ConversationText';

export default function NewsLayout({data, onClose=() => {}}) {

  const [segmentName, setSegmentName] = useState('official');
  const [completed, setCompleted] = useState(false);

  const headerRef = useRef(null);
  const bodyRef1 = useRef(null);
  const bodyRef2 = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (headerRef.current) {
        await headerRef.current.print(data[segmentName].headline);
      }
      if (bodyRef1.current) {
        await bodyRef1.current.print(data[segmentName].anchor_line);
      }
      if (bodyRef2.current) {
        await bodyRef2.current.print(data[segmentName].contextual_reframing);
      }
      setCompleted(true)
    }
    run()
    setCompleted(false)

  }
  , [headerRef, segmentName]);

  const skip = () => {
    if (headerRef.current) {
      headerRef.current.skip();
    }
    if (bodyRef1.current) {
      bodyRef1.current.skip();
    }
    if (bodyRef2.current) {
      bodyRef2.current.skip();
    }
  }

  const close = () => {
    if (segmentName === 'official') {
      setSegmentName('underground');
    } else {
      onClose();
    }
  }

  let segmentClass = ""
  switch (segmentName) {  
    case 'official':
      segmentClass = "bg-light";
      break;
    case 'underground':
      segmentClass = "bg-danger text-white";
      break;
    default:
      segmentClass = "bg-light";
  }

  return (
    <div className="container pt-5" >
      <div className={"card " + segmentClass}>
        <h5 className="card-header">
         <ConversationText key={segmentName+"0"} ref={headerRef} />
        </h5>
        <div className="card-body">
          <p className="card-text">
            <ConversationText key={segmentName+"1"} ref={bodyRef1} /> <ConversationText key={segmentName+"2"} ref={bodyRef2} placeholder="" />
          </p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary float-end" onClick={() => completed ? close() : skip()}>{completed ? "Close" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}