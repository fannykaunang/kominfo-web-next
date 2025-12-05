"use client";

import { useState } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/types";

interface MultipleTagSelectProps {
  tags: Tag[];
  selectedTags: string[]; // Array of tag IDs
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export function MultipleTagSelect({
  tags = [], // 👈 TAMBAH DEFAULT VALUE
  selectedTags = [], // 👈 TAMBAH DEFAULT VALUE
  onChange,
  disabled = false,
}: MultipleTagSelectProps) {
  const [open, setOpen] = useState(false);

  const handleToggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    onChange(newSelectedTags);
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId));
  };

  const getTagName = (tagId: string) => {
    return tags.find((t) => t.id === tagId)?.nama || "";
  };

  // 👈 TAMBAH CHECK - Jika tags belum load, tampilkan loading
  if (!tags) {
    return (
      <div className="w-full p-4 text-center text-sm text-muted-foreground">
        Loading tags...
      </div>
    );
  }

  // 👈 TAMBAH CHECK - Jika tags kosong
  if (tags.length === 0) {
    return (
      <div className="w-full p-4 text-center text-sm text-muted-foreground border rounded-md">
        Tidak ada tags tersedia
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedTags.length === 0
              ? "Pilih tags..."
              : `${selectedTags.length} tag dipilih`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Cari tags..." />
            <CommandList>
              <CommandEmpty>Tidak ada tag ditemukan</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.nama}
                    onSelect={() => handleToggleTag(tag.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selectedTags.includes(tag.id)
                            ? "bg-primary border-primary"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {selectedTags.includes(tag.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="flex-1">{tag.nama}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagId) => (
            <Badge
              key={tagId}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {getTagName(tagId)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tagId)}
                  className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
