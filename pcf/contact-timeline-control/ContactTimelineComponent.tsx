import * as React from "react";
import { PcfDatePicker } from "../shared/components/PcfDatePicker";

export interface ITimelineItem {
    id: string;
    type: string;
    title: string;
    description: string;
    date: Date;
    icon: string;
    status: string;
}

export interface IContactTimelineProps {
    contactId: string;
    maxItems: number;
    showFilters: boolean;
    context: ComponentFramework.Context<any>;
    onTimelineItemClick: (itemId: string, itemType: string) => void;
}

export interface IContactTimelineState {
    timelineItems: ITimelineItem[];
    isLoading: boolean;
    error: string | null;
    filterStartDate: Date | null;
    filterEndDate: Date | null;
    filterType: string;
}

export class ContactTimelineComponent extends React.Component<IContactTimelineProps, IContactTimelineState> {
    constructor(props: IContactTimelineProps) {
        super(props);
        
        this.state = {
            timelineItems: [],
            isLoading: true,
            error: null,
            filterStartDate: null,
            filterEndDate: null,
            filterType: "all",
        };
    }

    public componentDidMount(): void {
        this.loadTimelineData();
    }

    public componentDidUpdate(prevProps: IContactTimelineProps): void {
        if (prevProps.contactId !== this.props.contactId) {
            this.loadTimelineData();
        }
    }

    private async loadTimelineData(): Promise<void> {
        this.setState({ isLoading: true, error: null });

        try {
            // Simulate API call to load timeline data
            // In real implementation, use this.props.context.webAPI
            const mockData: ITimelineItem[] = [
                {
                    id: "1",
                    type: "phonecall",
                    title: "Phone Call with Customer",
                    description: "Discussed product requirements and pricing",
                    date: new Date(),
                    icon: "📞",
                    status: "completed",
                },
                {
                    id: "2",
                    type: "email",
                    title: "Follow-up Email Sent",
                    description: "Sent product brochure and pricing information",
                    date: new Date(Date.now() - 86400000),
                    icon: "📧",
                    status: "sent",
                },
                {
                    id: "3",
                    type: "appointment",
                    title: "Product Demo Scheduled",
                    description: "Scheduled for next week",
                    date: new Date(Date.now() + 604800000),
                    icon: "📅",
                    status: "scheduled",
                },
            ];

            this.setState({
                timelineItems: mockData,
                isLoading: false,
            });
        } catch (error) {
            this.setState({
                error: "Failed to load timeline data",
                isLoading: false,
            });
        }
    }

    private handleFilterChange = (filterType: string): void => {
        this.setState({ filterType });
    };

    private handleDateFilterChange = (startDate: Date | null, endDate: Date | null): void => {
        this.setState({
            filterStartDate: startDate,
            filterEndDate: endDate,
        });
    };

    private getFilteredItems(): ITimelineItem[] {
        let filtered = this.state.timelineItems;

        // Filter by type
        if (this.state.filterType !== "all") {
            filtered = filtered.filter(item => item.type === this.state.filterType);
        }

        // Filter by date range
        if (this.state.filterStartDate) {
            filtered = filtered.filter(item => item.date >= this.state.filterStartDate!);
        }
        if (this.state.filterEndDate) {
            filtered = filtered.filter(item => item.date <= this.state.filterEndDate!);
        }

        // Limit items
        return filtered.slice(0, this.props.maxItems);
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    private getStatusColor(status: string): string {
        switch (status) {
            case "completed": return "#10b981";
            case "sent": return "#3b82f6";
            case "scheduled": return "#f59e0b";
            default: return "#6b7280";
        }
    }

    public render(): React.ReactElement {
        const { showFilters } = this.props;
        const { isLoading, error } = this.state;
        const filteredItems = this.getFilteredItems();

        if (isLoading) {
            return (
                <div className="timeline-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading timeline...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="timeline-error">
                    <p>Error: {error}</p>
                    <button onClick={() => this.loadTimelineData()}>
                        Retry
                    </button>
                </div>
            );
        }

        return (
            <div className="contact-timeline">
                {showFilters && (
                    <div className="timeline-filters">
                        <div className="filter-group">
                            <label>Type:</label>
                            <select
                                value={this.state.filterType}
                                onChange={(e) => this.handleFilterChange(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="phonecall">Phone Calls</option>
                                <option value="email">Emails</option>
                                <option value="appointment">Appointments</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Date Range:</label>
                            <PcfDatePicker
                                value={this.state.filterStartDate}
                                onChange={(date) => this.handleDateFilterChange(date, this.state.filterEndDate)}
                                placeholder="Start Date"
                            />
                            <PcfDatePicker
                                value={this.state.filterEndDate}
                                onChange={(date) => this.handleDateFilterChange(this.state.filterStartDate, date)}
                                placeholder="End Date"
                            />
                        </div>
                    </div>
                )}

                <div className="timeline-items">
                    {filteredItems.length === 0 ? (
                        <div className="no-items">
                            <p>No timeline items found for this contact.</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="timeline-item"
                                onClick={() => this.props.onTimelineItemClick(item.id, item.type)}
                            >
                                <div className="timeline-icon">
                                    <span>{item.icon}</span>
                                </div>
                                
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h4>{item.title}</h4>
                                        <span 
                                            className="timeline-status"
                                            style={{ backgroundColor: this.getStatusColor(item.status) }}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    
                                    <p className="timeline-description">
                                        {item.description}
                                    </p>
                                    
                                    <div className="timeline-date">
                                        {this.formatDate(item.date)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="timeline-footer">
                    <button onClick={() => this.loadTimelineData()}>
                        Refresh Timeline
                    </button>
                </div>
            </div>
        );
    }
}
