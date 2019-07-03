import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export class PhoneNumberByCountry implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _phoneNumberElement: HTMLInputElement;
	private _phoneNumberTypeElement: HTMLElement;
	private _phoneNumber: string;

	private _phoneNumberChanged: EventListenerOrEventListenerObject;

	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;
	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		// Add control initialization code
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;

		// Add control initialization code
		this._phoneNumberChanged = this.phoneNumberChanged.bind(this);
		// textbox control
		this._phoneNumberElement = document.createElement("input");
		this._phoneNumberElement.setAttribute("type", "text");
		this._phoneNumberElement.setAttribute("class", "pcfinputcontrol");
		this._phoneNumberElement.addEventListener("change", this._phoneNumberChanged);

		this._phoneNumberTypeElement = document.createElement("img");
		this._phoneNumberTypeElement.setAttribute("class", "pcfimagecontrol");
		this._phoneNumberTypeElement.setAttribute("height", "24px");

		this._container.appendChild(this._phoneNumberElement);
		this._container.appendChild(this._phoneNumberTypeElement);
		// @ts-ignore
		if (Xrm.Page.ui.getFormType() == 3 || Xrm.Page.ui.getFormType() == 4)
			this._phoneNumberElement.readOnly = true;
		var actualPhoneNumber = this._context.parameters.PhoneNumber.raw;
		if (actualPhoneNumber != null && actualPhoneNumber.length > 0) {
			this._phoneNumberElement.value = actualPhoneNumber;
			this.findAndSetFlag();
		}
	}
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
		// @ts-ignore
		//var crmPhoneNumberAttribute = this._context.parameters.PhoneNumber.attributes.LogicalName;
		this._context.parameters.PhoneNumber == undefined ? "": this._context.parameters.PhoneNumber.raw;
		// @ts-ignore 
		//Xrm.Page.getAttribute(crmPhoneNumberAttribute).setValue(this._context.parameters.PhoneNumber.formatted);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			PhoneNumber: this._phoneNumber
		};
	}
	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
		this._phoneNumberElement.removeEventListener("change", this._phoneNumberChanged);
	}
	/**
	 * Called when a change is detected in the phone number input
	 * @param imageName Name of the image to retrieve
	 */
	private findAndSetImage(imageName: string) {
		this._context.resources.getResource("img/" + imageName + ".png",
			data => {
				this._phoneNumberTypeElement.setAttribute("src", this.generateImageSrcUrl(".png", data));
			},
			() => {
				console.log('Error when downloading ' + imageName + '.png image.');
			});
	}
	/**
 	* Called when a change is detected in the phone number input
	* @param filetype Name of the image extension
	* @param fileContent Base64 image content
	*/
	private generateImageSrcUrl(fileType: string, fileContent: string): string {
		return "data:image/" + fileType + ";base64," + fileContent;
	}
	/**
	* Called when a change is detected in the phone number input. Ensure it's a valid phone number with a calling code and call findAndSetImage function.
	*/
	private findAndSetFlag() {
		var phoneNumber = this._phoneNumberElement.value;
		if (phoneNumber != null && phoneNumber.length > 0) {
			var phoneNumberParsed = parsePhoneNumberFromString(phoneNumber)
			if (phoneNumberParsed && phoneNumberParsed.isValid()) {
				phoneNumber = phoneNumberParsed.formatInternational();
				if (phoneNumberParsed.country)
					this.findAndSetImage(phoneNumberParsed.country.toLowerCase());
				else
					this.findAndSetImage("warning");
				this._phoneNumberElement.value = phoneNumber;
				this._phoneNumber = phoneNumber;
			}
			else
				this.findAndSetImage("warning");
		}
		else {
			this._phoneNumberTypeElement.removeAttribute("src");
			this._phoneNumber = "";
		}

	}
	/**
	* Called when a change is detected in the phone number input.
	*/
	private phoneNumberChanged(evt: Event): void {
		this.findAndSetFlag()
		this._notifyOutputChanged();
	}
}