const helpers = {
  selected: function(target: string, toMatch: string) {
    return target === toMatch ? " selected" : "";
  },
  eachInMap: function(map: Map<string, string>, block: any) {
    let output = "";

    for (const [ key, value ] of map) {
      output += block.fn({ key, value });
    }

    return output;
  },
};

export default helpers;
