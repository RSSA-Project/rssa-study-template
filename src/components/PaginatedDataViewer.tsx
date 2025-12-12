
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import { useStudy } from 'rssa-api';

type PaginatedDataList<T> = {
    data: T[];
    count: number;
};

interface PaginatedResourceViewerProps<T> {
    apiResourceTag: string;
    limit?: number;
    children: (data: T[], selectedItem: T | null, handleItemClick: (item: T) => void) => React.ReactNode;
}

const PaginatedResourceViewer = <T extends { id: string }>({
    apiResourceTag,
    limit = 10,
    children,
}: PaginatedResourceViewerProps<T>) => {
    const [page, setPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const { studyApi } = useStudy();

    const fetchResources = async (page: number) => {
        const offset = page * limit;
        return studyApi.get<PaginatedDataList<T>>(`${apiResourceTag}/?offset=${offset}&limit=${limit}`);
    };

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: [apiResourceTag, page],
        queryFn: () => fetchResources(page),
        enabled: !!studyApi,
        placeholderData: keepPreviousData,
    });

    const handleItemClick = (item: T) => {
        if (selectedItem?.id === item.id) {
            setSelectedItem(null);
        } else {
            setSelectedItem(item);
        }
    };

    const resourceList = data?.data || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    if (isLoading && !data) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading {apiResourceTag}...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error: {error.message}</div>;
    }

    return (
        <div className="flex flex-col">
            {isFetching && <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50"></div>}
            <div className="">{children(resourceList, selectedItem, handleItemClick)}</div>
            <div className={clsx('flex-shrink-0 p-4', 'flex items-center justify-center')}>
                <button
                    onClick={() => setPage((old) => Math.max(old - 1, 0))}
                    disabled={page === 0 || isFetching}
                    className={clsx(
                        'px-4 py-2 mx-1 text-sm font-medium text-gray-700 rounded-3',
                        'bg-amber-500 rounded-md disabled:opacity-50',
                        'cursor-pointer',
                        'disabled:cursor-not-allowed'
                    )}
                >
                    <span className="sr-only">Left navigation button</span>
                    <ChevronLeftIcon className="h-9 w-9" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 mx-4">
                    Page {page + 1} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((old) => (page + 1 < totalPages ? old + 1 : old))}
                    disabled={page + 1 >= totalPages || isFetching}
                    className={clsx(
                        'px-4 py-2 mx-1 text-sm font-medium text-gray-700 rounded-3',
                        'bg-amber-500 rounded-md disabled:opacity-50',
                        'cursor-pointer',
                        'disabled:cursor-not-allowed'
                    )}
                >
                    <span className="sr-only">Right navigation button</span>
                    <ChevronRightIcon className="h-9 w-9" />
                </button>
            </div>
        </div>
    );
};

export default PaginatedResourceViewer;
