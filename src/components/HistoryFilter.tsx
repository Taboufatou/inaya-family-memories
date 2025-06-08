
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, X } from "lucide-react";

interface HistoryFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  dateRange: 'all' | 'week' | 'month' | 'year';
  author: 'all' | 'papa' | 'maman';
  searchTerm: string;
  startDate?: string;
  endDate?: string;
}

const HistoryFilter = ({ onFilterChange, currentFilters }: HistoryFilterProps) => {
  const handleFilterUpdate = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...currentFilters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      dateRange: 'all',
      author: 'all',
      searchTerm: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres d'historique
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Effacer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Période</label>
          <Select value={currentFilters.dateRange} onValueChange={(value) => handleFilterUpdate('dateRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les périodes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Auteur</label>
          <Select value={currentFilters.author} onValueChange={(value) => handleFilterUpdate('author', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les auteurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les auteurs</SelectItem>
              <SelectItem value="papa">Papa</SelectItem>
              <SelectItem value="maman">Maman</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Date de début</label>
          <Input
            type="date"
            value={currentFilters.startDate || ''}
            onChange={(e) => handleFilterUpdate('startDate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Date de fin</label>
          <Input
            type="date"
            value={currentFilters.endDate || ''}
            onChange={(e) => handleFilterUpdate('endDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Recherche</label>
        <Input
          placeholder="Rechercher dans les titres et descriptions..."
          value={currentFilters.searchTerm}
          onChange={(e) => handleFilterUpdate('searchTerm', e.target.value)}
        />
      </div>
    </div>
  );
};

export default HistoryFilter;
