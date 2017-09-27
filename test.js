const obj = require('./json.json');

const processObjects = objects => {
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if(obj.type === 'group' && obj.row && obj.seat){
      let svgChunk;
      const circle = obj.objects.filter(obj => obj.type === 'circle')[0];
      svgChunk = `<circle cx="${obj.left}" cy="${obj.top}" data-row="${obj.row}" data-seat="${obj.seat}" data-id="${obj.ticketId}" r="${circle.radius}"></circle>`;
      console.log(svgChunk)
    } else  if(obj.objects){
      processObjects(obj.objects);
    }
  }
}

processObjects(obj.objects);