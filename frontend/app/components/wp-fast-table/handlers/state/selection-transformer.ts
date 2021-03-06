import {injectorBridge} from "../../../angular/angular-injector-bridge.functions";
import {States} from "../../../states.service";
import {tableRowClassName} from "../../builders/rows/single-row-builder";
import {checkedClassName} from "../../builders/ui-state-link-builder";
import {rowId, locateTableRow} from "../../helpers/wp-table-row-helpers";
import {WorkPackageTableSelection} from "../../state/wp-table-selection.service";
import {WorkPackageTable} from "../../wp-fast-table";
import {WPTableRowSelectionState} from "../../wp-table.interfaces";

export class SelectionTransformer {
  public wpTableSelection:WorkPackageTableSelection;
  public states:States;
  public FocusHelper:any;

  // When first entering the page, the user
  // wants to scroll to the focused work package in the table.
  // We only want to do this once, so remember when we did the first focus
  private hasFocusedOnElement = false;

  constructor(table:WorkPackageTable) {
    injectorBridge(this);

    // Focus a single selection when active
    this.states.table.rendered.values$()
      .takeUntil(this.states.table.stopAllSubscriptions)
      .subscribe(() => {
        const singleSelection = this.wpTableSelection.getSingleSelection;
        if (singleSelection === null) {
          return;
        }

        if (!this.hasFocusedOnElement) {
          this.hasFocusedOnElement = true;
          const element = locateTableRow(singleSelection);
          if (element.length) {
            element[0].scrollIntoView();
            this.FocusHelper.focusElement(element, true);
          }
        }
    });


    // Update selection state
    this.wpTableSelection.selectionState.values$()
      .takeUntil(this.states.table.stopAllSubscriptions)
      .subscribe((state: WPTableRowSelectionState) => {
        this.renderSelectionState(state);
      });

    // Bind CTRL+A to select all work packages
    Mousetrap.bind(['command+a', 'ctrl+a'], (e) => {
      this.wpTableSelection.selectAll(table.renderedRows);

      e.preventDefault();
      return false;
    });

    // Bind CTRL+D to deselect all work packages
    Mousetrap.bind(['command+d', 'ctrl+d'], (e) => {
      this.wpTableSelection.reset();
      e.preventDefault();
      return false;
    });
  }

  /**
   * Update all currently visible rows to match the selection state.
   */
  private renderSelectionState(state:WPTableRowSelectionState) {
    jQuery(`.${tableRowClassName}.${checkedClassName}`).removeClass(checkedClassName);

    _.each(state.selected, (selected: boolean, workPackageId:any) => {
      jQuery(`.${tableRowClassName}[data-work-package-id="${workPackageId}"]`).toggleClass(checkedClassName, selected);
    });
  }
}

SelectionTransformer.$inject = ['wpTableSelection', 'states', 'FocusHelper'];
