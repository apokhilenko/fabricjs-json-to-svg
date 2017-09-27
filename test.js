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
    acc += processTopLevelGroup(group);

    return acc;
  }, '');

  fs.writeFile('result.svg', `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${result}</svg>`, 'utf8');
}

processTopLevelGroup = (group) => {
  const { left, top, width, height, objects } = group;
  const normalizedGroups = normalizeGroups(objects);

  const result = normalizedGroups.reduce((acc, el) => {
    if (el.objects.length > 1) {
      acc += processCircleGroup(el, left, top);
    } else if (el.objects.length === 1) {
      acc += processRowGroup(el, left, top);
    }

    return acc;
  }, '');
  const rect = `<rect x="${left}" y="${top}" width="${width}" height="${height}" stroke="black" fill="transparent" stroke-width="3"/>`;

  return result + rect;
}

processCircleGroup = (group, groupX, groupY) => {
  const { left, top, row, seat, ticketId } = group;
  const [circle] = group.objects;
  const { radius } = circle;
  const svgChunk = `<circle cx="${left + groupX + radius}" cy="${top + groupY + radius}" data-row="${row}" data-seat="${seat}" data-id="${ticketId}" r="${radius}"></circle>`;

  return svgChunk;
}

processRowGroup = (group, groupX, groupY) => {
  const { left, top } = group;
  const [textNode] = group.objects;
  const { text, height } = textNode;
  const svgChunk = `<text x="${left + groupX + height / 2}" y="${top + groupY + height / 2}">${text}</text>`;

  return svgChunk;
}

processTopLevel(obj.objects)

