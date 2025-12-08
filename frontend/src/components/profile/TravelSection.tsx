import { Edit2, Check, Trash2, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoComplete, type Option } from '@/components/ui/autocomplete';

interface TravelSectionProps {
  sectionType: 'languages' | 'hobbies' | 'countries';
  title: string;
  icon: LucideIcon;
  iconColorVar: string;
  iconBgVar: string;
  buttonColorVar: string;
  buttonHoverVar: string;
  badgeBgVar: string;
  badgeTextVar: string;
  badgeBorderVar: string;
  borderVar: string;
  bgFromVar: string;
  bgViaVar: string;
  bgToVar: string;
  isEditing: boolean;
  isSaving: boolean;
  activeInput: 'languages' | 'hobbies' | 'countries' | null;
  options: Option[];
  tempItems: string[];
  displayItems: Array<{ value: string; label: string }>;
  selectedOption: Option | undefined;
  onEdit: () => void;
  onAdd: (option: Option) => void;
  onRemove: (value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onSetActiveInput: (section: 'languages' | 'hobbies' | 'countries') => void;
  onSetSelectedOption: (option: Option | undefined) => void;
  placeholder: string;
  emptyMessage: string;
  getItemLabel: (value: string) => string;
}

export const TravelSection = ({
  sectionType,
  title,
  icon: Icon,
  iconColorVar,
  iconBgVar,
  buttonColorVar,
  buttonHoverVar,
  badgeBgVar,
  badgeTextVar,
  badgeBorderVar,
  borderVar,
  bgFromVar,
  bgViaVar,
  bgToVar,
  isSaving,
  activeInput,
  options,
  tempItems,
  displayItems,
  selectedOption,
  onEdit,
  onAdd,
  onRemove,
  onSave,
  onCancel,
  onSetActiveInput,
  onSetSelectedOption,
  placeholder,
  emptyMessage,
  getItemLabel,
}: TravelSectionProps) => {
  const isActive = activeInput === sectionType;

  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        background: `linear-gradient(to bottom right, var(${bgFromVar}), var(${bgViaVar}), var(${bgToVar}))`,
        borderColor: `var(${borderVar})`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `var(${iconBgVar})` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: `var(${iconColorVar})` }}
            />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {isActive ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 rounded-full border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
              disabled={isSaving}
            >
              <X className="w-4 h-4 text-destructive" />
            </Button>
            <Button
              onClick={onSave}
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              style={{
                backgroundColor: `var(${buttonColorVar})`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `var(${buttonHoverVar})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `var(${buttonColorVar})`;
              }}
              disabled={isSaving}
            >
              <Check className="w-4 h-4 text-white" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              onSetActiveInput(sectionType);
              onEdit();
            }}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            style={{ backgroundColor: `var(${iconBgVar})` }}
          >
            <Edit2
              className="w-4 h-4"
              style={{ color: `var(${iconColorVar})` }}
            />
          </Button>
        )}
      </div>

      {isActive ? (
        <>
          <div className="mb-3">
            <AutoComplete
              options={options.filter(opt => !tempItems.includes(opt.value))}
              value={selectedOption}
              onValueChange={(option) => {
                onAdd(option);
                onSetSelectedOption(undefined);
              }}
              placeholder={placeholder}
              emptyMessage={emptyMessage}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {tempItems.length > 0 ? (
              tempItems.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{
                    backgroundColor: `var(${badgeBgVar})`,
                    color: `var(${badgeTextVar})`,
                    borderColor: `var(${badgeBorderVar})`,
                  }}
                >
                  {getItemLabel(value)}
                  <button
                    onClick={() => onRemove(value)}
                    className="hover:text-destructive transition-colors"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No items added</span>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm"
                style={{
                  backgroundColor: `var(${badgeBgVar})`,
                  color: `var(${badgeTextVar})`,
                  borderColor: `var(${badgeBorderVar})`,
                }}
              >
                {item.label}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">None added</span>
          )}
        </div>
      )}
    </div>
  );
};

