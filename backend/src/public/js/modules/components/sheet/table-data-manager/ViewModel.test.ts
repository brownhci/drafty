import { ViewModel } from "./ViewModel";
import { DOMForwardingInstantiation } from "./Instantiation";
import { MutationReporter } from "./MutationReporter";


describe("View Model", () => {
  let source: HTMLElement;
  let viewModel: ViewModel;

  beforeEach(() => {
    source = document.createElement("tr");
    source.innerHTML = `
      <td id="900000" tabindex="-1">A. J. Kfoury</td>
      <td id="900001" tabindex="-1">Boston University</td>
      <td id="961360" tabindex="-1">1999</td>
      <td id="961363" tabindex="-1">Machine learning &amp; data mining</td>
      <td id="961365" tabindex="-1">Brown University</td>
      <td id="961368" tabindex="-1">Harvard University</td>
    `;
    viewModel = new ViewModel({
      children: {
        get: DOMForwardingInstantiation.defaultForwardingDescriptor__("children").get,
        set: () => undefined,
      }}, source, undefined, undefined, undefined, [
      element => new ViewModel({"id": undefined, "tabindex": undefined, "textContent": undefined}, element)
    ]);
    viewModel.patchWithDOM__(source);
  });

  test("unique identifier", () => {
    viewModel.operateOnRange__(viewModel => viewModel.element_.setAttribute(`data-${ViewModel.identifierDatasetName_}`, viewModel.identifier_));
    const identifiers: Array<string> = viewModel.operateOnRange__(viewModel => viewModel.identifier_);
    expect(identifiers.length).toBe(6);
    const table = document.createElement("table");
    table.appendChild(source);
    document.body.appendChild(table);
    expect(ViewModel.getElementByIdentifier(identifiers[0])).toBe(source.children[0]);
  });

  test("Access Properties", () => {
    expect(new Set(Object.keys(viewModel))).toEqual(new Set(["children"]));
    expect((viewModel as any).children.length).toBe(6);
    expect(viewModel.children_.length).toBe(6);
    expect(viewModel.element_).toBe(source);
    expect((viewModel.children_[0] as any).textContent).toBe("A. J. Kfoury");
    expect((viewModel.children_[2] as any).textContent).toBe("1999");
    expect((viewModel.children_[4] as any).id).toBe("961365");
  });

  test("create view model to accomodate DOM child", () => {
    viewModel.removeChildByIndex__(0);
    viewModel.removeChild__(viewModel.children_[0]);
    expect(viewModel.children_.length).toBe(4);
    expect((viewModel as any).children.length).toBe(6);
    // debugger;
    viewModel.patchWithDOM__(source.cloneNode(true) as HTMLElement);
    expect((viewModel as any).children.length).toBe(6);
    expect(viewModel.children_.length).toBe(6);
    expect((viewModel.children_[0] as any).textContent).toBe("A. J. Kfoury");
    expect((viewModel.children_[2] as any).textContent).toBe("1999");
    expect((viewModel.children_[4] as any).id).toBe("961365");
  });

  test("observe childList mutation", done => {
    const vm: ViewModel = new ViewModel({
      children: {
        get: DOMForwardingInstantiation.defaultForwardingDescriptor__("children").get,
        set: () => undefined,
      }}, source, undefined, undefined, undefined, [
      element => new ViewModel({"id": undefined, "tabindex": undefined, "textContent": undefined}, element)
    ]);
    vm.setMutationReporter__(function(mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) {
          this.onMutation__(mutations, observer, originalMutations, reporter);
          expect((vm as any).children.length).toBe(6);
          expect(vm.children_.length).toBe(6);
          expect(vm.element_).toBe(source);
          expect((vm.children_[0] as any).textContent).toBe("Amy J. Ko");
          expect((vm.children_[2] as any).textContent).toBe("2014");
          expect((vm.children_[4] as any).id).toBe("962819");
          vm.unobserve__(vm.element_);
          vm.patchWithViewModel__(viewModel);
          expect((vm as any).children.length).toBe(6);
          expect(vm.children_.length).toBe(6);
          expect(vm.element_).toBe(source);
          expect((vm.children_[0] as any).textContent).toBe("A. J. Kfoury");
          expect((vm.children_[2] as any).textContent).toBe("1999");
          expect((vm.children_[4] as any).id).toBe("961365");
          done();
        }.bind(vm));

    vm.observe__(vm.element_, false, undefined, false, true, false);
    source.innerHTML = `<td id="900014" tabindex="-1">Amy J. Ko</td><td id="900015" tabindex="-1">University of Washington</td><td id="962817" tabindex="-1">2014</td><td id="962820" tabindex="-1">Software engineering</td><td id="962819" tabindex="-1">Oregon State University</td><td id="962818" tabindex="-1">Carnegie Mellon University</td>`;
  });
});
