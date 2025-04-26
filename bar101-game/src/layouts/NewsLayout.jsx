import React, { useState, useRef, useEffect } from 'react';
import ConversationText from '../components/chat/ConversationText';

export default function NewsLayout({data, onClose=() => {}}) {

  const [segmentName, setSegmentName] = useState('official');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [newsImage, setNewsImage ] = useState('');
  const [completed, setCompleted] = useState(false);

  const headerRef = useRef(null);
  const bodyRef1 = useRef(null);
  const bodyRef2 = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (headerRef.current) {
        headerRef.current.clear();
      }
      if (bodyRef1.current) {
        bodyRef1.current.clear();
      }
      if (bodyRef2.current) {
        bodyRef2.current.clear();
      }
      if (headerRef.current) {
        await headerRef.current.print(data[segmentName][segmentIndex].headline, "news_"+segmentName);
      }
      if (bodyRef1.current) {
        await bodyRef1.current.print(data[segmentName][segmentIndex].anchor_line, "news_"+segmentName);
      }
      if (bodyRef2.current) {
        await bodyRef2.current.print(data[segmentName][segmentIndex].contextual_reframing, "news_"+segmentName);
      }
      setCompleted(true)
    }
    run()
    setNewsImage(data[segmentName][segmentIndex].image);
    setCompleted(false)

  }
  , [headerRef, segmentName, segmentIndex]);

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
    if (segmentIndex < data[segmentName].length - 1) {
      setSegmentIndex(prev => prev + 1);
      return 
    }

    if (segmentName === 'official') {
      setSegmentName('underground');
      setSegmentIndex(0);
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
          <div className="row">
            <div className="col-lg-2 col-md-4 col-sm-4 col-5">
              <img src={`/story/${newsImage}`} className="card-img-top" />
            </div>
            <div className="col-lg-9 col-md-8 col-sm-8 col-7">
              <p className="card-text">
                <ConversationText key={segmentName+"1"} ref={bodyRef1} /> <ConversationText key={segmentName+"2"} ref={bodyRef2} placeholder="" />
              </p>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary float-end" onClick={() => completed ? close() : skip()}>{completed ? "Close" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}