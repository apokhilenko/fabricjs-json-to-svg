const obj = require('./json.json');
const fs = require('fs');

normalizeGroups = (groups) => {
  const offsets = groups.reduce((acc, group) => {
    const { left, top } = group;
    if (left < acc[0]) {
      acc[0] = left;
    }
    if (top < acc[1]) {
      acc[1] = top;
    }

    return acc;
  }, [0, 0]);

  const [offsetX, offsetY] = offsets;

  return groups.map((group) => Object.assign({}, group, { left: group.left - offsetX }, { top: group.top - offsetY }))
}

calculateSizes = (groups) =>
  groups.reduce((acc, group) => {
    const { left, top, width, height } = group;
    if (left + width > acc[0]) {
      acc[0] = left + width;
    }
    if (top + height > acc[1]) {
      acc[1] = top + height;
    }

    return acc;
  }, [0, 0]);


processTopLevel = ([stage, ...groups]) => {
  const normalizedGroups = normalizeGroups(groups);
  const [width, height] = calculateSizes(normalizedGroups);
  const result = normalizedGroups.reduce((acc, group) => {
    const result = processTopLevelGroup(group);
    acc.sectors.push(result.sector);
    acc.seats = acc.seats.concat(result.seats);

    return acc;
  }, { sectors: [], seats: [] });

  result.width = width;
  result.height = height;

  result.seats = result.seats.map((seat, index) => Object.assign({}, seat, {id: index}));
  result.sectors = result.sectors.map((sector, index) => Object.assign({}, sector, {id: index}));

  fs.writeFile('result.json', JSON.stringify(result), 'utf8');
}

processTopLevelGroup = (group) => {
  const { left, top, width, height, objects } = group;
  const normalizedGroups = normalizeGroups(objects);

  const seats = normalizedGroups.reduce((acc, el) => {
    if (el.objects.length > 1) {
      acc.push(processCircleGroup(el, left, top));
    }

    return acc;
  }, []);

  const sector = {
    left,
    top,
    width,
    height
  }

  return { sector, seats };
}

processCircleGroup = (group, groupX, groupY, id) => {
  const { left, top, row, seat, ticketId } = group;
  const [circle] = group.objects;
  const { radius } = circle;

  return {
    id,
    x: left + groupX + radius,
    y: top + groupY + radius,
    row,
    seat,
    ticketId,
  }
}

processRowGroup = (group, groupX, groupY) => {
  const { left, top } = group;
  const [textNode] = group.objects;
  const { text, height } = textNode;
  const svgChunk = `<text x="${left + groupX + height / 2}" y="${top + groupY + height / 2}">${text}</text>`;

  return svgChunk;
}

processTopLevel(obj.objects)

