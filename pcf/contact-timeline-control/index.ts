import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ContactTimelineComponent, IContactTimelineProps } from "./ContactTimelineComponent";

export class ContactTimelineControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;

    /**
     * Empty constructor.
     */
    constructor() {
        // Constructor logic
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Initialize the React component
        this.renderComponent();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this.renderComponent();
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
    }

    /**
     * Render the React component
     */
    private renderComponent(): void {
        const contactId = this._context.parameters.contactId.raw || "";
        const maxItems = this._context.parameters.maxItems.raw || 10;
        const showFilters = this._context.parameters.showFilters.raw || false;

        const props: IContactTimelineProps = {
            contactId,
            maxItems,
            showFilters,
            context: this._context,
            onTimelineItemClick: this.onTimelineItemClick.bind(this),
        };

        ReactDOM.render(
            React.createElement(ContactTimelineComponent, props),
            this._container
        );
    }

    /**
     * Handle timeline item click
     */
    private onTimelineItemClick(itemId: string, itemType: string): void {
        // Navigate to the record or perform action
        if (this._context.navigation && this._context.navigation.openForm) {
            this._context.navigation.openForm({
                entityName: itemType,
                entityId: itemId,
            });
        }
    }
}
