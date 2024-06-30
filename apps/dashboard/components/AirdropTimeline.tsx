import { cn } from "@ui/lib/utils";

function getMonthName(date: Date): string {
  const monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];
  return monthNames[date.getMonth()];
}

const ACTIVE_TEXT_COLOR = "text-slate-900";
const INACTIVE_TEXT_COLOR = "text-slate-500";

const ACTIVE_BG_COLOR = "bg-highlight-secondary";
const INACTIVE_BG_COLOR = "bg-slate-300";

const ACTIVE_BORDER_COLOR = "border-highlight-secondary";
const INACTIVE_BORDER_COLOR = "border-slate-300";

function getActiveTextColor(active: boolean): string {
  return active ? ACTIVE_TEXT_COLOR : INACTIVE_TEXT_COLOR;
}

function getActiveBgColor(active: boolean): string {
  return active ? ACTIVE_BG_COLOR : INACTIVE_BG_COLOR;
}

function getActiveBorderColor(active: boolean): string {
  return active ? ACTIVE_BORDER_COLOR : INACTIVE_BORDER_COLOR
}

interface AirdropTimelineLineProps {
  active: boolean;
  size?: "small" | "default";
}
function AirdropTimelineLine({ active, size }: AirdropTimelineLineProps) {
  if (size === undefined) {
    size = "default";
  }

  return (
    <div className="grid grid-cols-9">
      <div className="col-span-2"/>
      <div className="col-span-1 flex flex-auto justify-center items-center">
        <div className={cn("col-span-3 left-0 top-0 h-full border-l-2", getActiveBorderColor(active))} />
      </div>
      <div className={cn("col-span-4 text-white select-none", size === "small" && "text-xs")}>
        {" hi mom"}
      </div>
    </div>
  );
}

interface AirdropTimelineFooterProps {
  date: Date;
  active: boolean;
}

function AirdropTimelineDate({ date, active }: AirdropTimelineFooterProps) {
  return (
    <div className="col-span-2 flex flex-auto justify-end items-center">
      <div className={cn("col-span-1 text-xs font-medium", getActiveTextColor(active))}>{date.getDate()} {getMonthName(date)}</div>
    </div>
  );
}

interface AirdropTimelineHeaderProps {
  date: Date;
}

// get month string and year from date
export function AirdropTimelineHeader({ date }: AirdropTimelineHeaderProps) {
  return (
    <div className="bg-slate-50 flex flex-auto p-2 pl-4">
      <h2 className="text-slate-500">{getMonthName(date)} {date.getFullYear()}</h2>
    </div>
  );
}

interface AirdropTimelineSectionDiamondProps {
  date: Date;
  title: string;
  active: boolean;
  includeTopLine?: boolean;
  includeBottomLine?: boolean;
}

export function AirdropTimelineSectionDiamond({ date, title, active, includeTopLine, includeBottomLine }: AirdropTimelineSectionDiamondProps) {
  return (
    <div className={cn("", includeBottomLine && "mt-2", (!includeBottomLine && !includeTopLine) && "mb-2")}>
      {includeTopLine && AirdropTimelineLine({ active, size: "small" })}

      <div className="grid grid-cols-9">
        <AirdropTimelineDate date={date} active={active} />
        <div className="col-span-1 flex flex-auto justify-center items-center">
          <div className={cn(" w-4 h-4 transform rotate-45", getActiveBgColor(active))} />
        </div>
        <div className="col-span-4 flex flex-auto justify-start items-center">
          <h3 className={cn("text-lg font-semibold", getActiveTextColor(active))}>{title}</h3>
        </div>
      </div>

      {includeBottomLine && AirdropTimelineLine({ active })}
    </div>
  );
}


interface AirdropTimelineSectionProps {
  date: Date;
  title: string;
  active: boolean;
  includeTopLine?: boolean;
  children: React.ReactNode;
}

export function AirdropTimelineSection({ date, title, active, includeTopLine, children }: AirdropTimelineSectionProps) {
  return (
    <>
      {includeTopLine && AirdropTimelineLine({ active, size: "small" })}
      
      <div className="grid grid-cols-9">
        <AirdropTimelineDate date={date} active={active} />
        <div className="col-span-1 flex flex-auto justify-center items-center">
          <div className={cn("text-white w-6 h-6 flex items-center justify-center rounded-full", getActiveBgColor(active))}>1</div>
        </div>
        <div className="col-span-4 flex flex-auto justify-start items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-9">
        <div className="col-span-2"/>
        <div className="col-span-1 flex flex-auto justify-center items-center">
          <div className={cn("col-span-3 left-0 top-0 h-full border-l-2", getActiveBorderColor(active))} />
        </div>
        <div className={cn("col-span-4 text-sm flex flex-col mb-6", getActiveTextColor(active))}>
          {children}
        </div>
      </div>
    </>
  );
}