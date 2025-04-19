import React, { useState} from 'react';

export default function NewsLayout({data, onClose=() => {}}) {

  const [segmentName, setSegmentName] = useState('official');

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
         {data[segmentName].headline}
        </h5>
        <div className="card-body">
          <p className="card-text">{data[segmentName].anchor_line} {data[segmentName].contextual_reframing}</p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary float-end" onClick={() => close()}>Close</button>
        </div>
      </div>
    </div>
  );
}