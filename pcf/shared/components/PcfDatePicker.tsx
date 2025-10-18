import * as React from "react";

export interface IPcfDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

export interface IPcfDatePickerState {
    inputValue: string;
    isValid: boolean;
}

/**
 * PCF-compatible DatePicker component using React 16
 * Provides a simple date input with validation
 */
export class PcfDatePicker extends React.Component<IPcfDatePickerProps, IPcfDatePickerState> {
    constructor(props: IPcfDatePickerProps) {
        super(props);
        
        this.state = {
            inputValue: this.formatDateForInput(props.value),
            isValid: true,
        };
    }

    public componentDidUpdate(prevProps: IPcfDatePickerProps): void {
        if (prevProps.value !== this.props.value) {
            this.setState({
                inputValue: this.formatDateForInput(this.props.value),
                isValid: true,
            });
        }
    }

    private formatDateForInput(date: Date | null): string {
        if (!date) return "";
        
        // Format as YYYY-MM-DD for HTML date input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    private parseInputDate(value: string): Date | null {
        if (!value) return null;
        
        const date = new Date(value + 'T00:00:00');
        return isNaN(date.getTime()) ? null : date;
    }

    private validateDate(date: Date | null): boolean {
        if (!date) return true;
        
        const { minDate, maxDate } = this.props;
        
        if (minDate && date < minDate) return false;
        if (maxDate && date > maxDate) return false;
        
        return true;
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        const parsedDate = this.parseInputDate(value);
        const isValid = this.validateDate(parsedDate);
        
        this.setState({
            inputValue: value,
            isValid,
        });
        
        if (isValid && this.props.onChange) {
            this.props.onChange(parsedDate);
        }
    };

    private handleBlur = (): void => {
        const { inputValue } = this.state;
        const parsedDate = this.parseInputDate(inputValue);
        const isValid = this.validateDate(parsedDate);
        
        if (!isValid && this.props.onChange) {
            // Reset to previous valid value
            this.setState({
                inputValue: this.formatDateForInput(this.props.value),
                isValid: true,
            });
        }
    };

    private handleClear = (): void => {
        this.setState({
            inputValue: "",
            isValid: true,
        });
        
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    };

    public render(): React.ReactElement {
        const { placeholder, disabled, className } = this.props;
        const { inputValue, isValid } = this.state;
        
        const inputClassName = [
            "pcf-date-picker",
            className || "",
            !isValid ? "pcf-date-picker--invalid" : "",
        ].filter(Boolean).join(" ");

        return (
            <div className="pcf-date-picker-container">
                <div className="pcf-date-picker-input-group">
                    <input
                        type="date"
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={inputClassName}
                        min={this.props.minDate ? this.formatDateForInput(this.props.minDate) : undefined}
                        max={this.props.maxDate ? this.formatDateForInput(this.props.maxDate) : undefined}
                    />
                    
                    {inputValue && !disabled && (
                        <button
                            type="button"
                            className="pcf-date-picker-clear"
                            onClick={this.handleClear}
                            title="Clear date"
                        >
                            ×
                        </button>
                    )}
                </div>
                
                {!isValid && (
                    <div className="pcf-date-picker-error">
                        Please enter a valid date within the allowed range.
                    </div>
                )}
                
                <style>{`
                    .pcf-date-picker-container {
                        position: relative;
                        display: inline-block;
                        width: 100%;
                    }
                    
                    .pcf-date-picker-input-group {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    
                    .pcf-date-picker {
                        width: 100%;
                        padding: 6px 8px;
                        border: 1px solid #8a8886;
                        border-radius: 2px;
                        font-size: 14px;
                        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #ffffff;
                        color: #323130;
                    }
                    
                    .pcf-date-picker:focus {
                        outline: none;
                        border-color: #0078d4;
                        box-shadow: 0 0 0 1px #0078d4;
                    }
                    
                    .pcf-date-picker:disabled {
                        background-color: #f3f2f1;
                        color: #a19f9d;
                        cursor: not-allowed;
                    }
                    
                    .pcf-date-picker--invalid {
                        border-color: #d13438;
                    }
                    
                    .pcf-date-picker--invalid:focus {
                        border-color: #d13438;
                        box-shadow: 0 0 0 1px #d13438;
                    }
                    
                    .pcf-date-picker-clear {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: none;
                        border: none;
                        font-size: 18px;
                        color: #8a8886;
                        cursor: pointer;
                        padding: 0;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 2px;
                    }
                    
                    .pcf-date-picker-clear:hover {
                        background-color: #f3f2f1;
                        color: #323130;
                    }
                    
                    .pcf-date-picker-error {
                        margin-top: 4px;
                        font-size: 12px;
                        color: #d13438;
                        line-height: 1.3;
                    }
                `}</style>
            </div>
        );
    }
}
