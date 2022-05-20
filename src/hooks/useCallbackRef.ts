import {useCallback,useRef} from 'react'

export function useCallbackRef<FN extends (...args:any[])=>any>(fn:FN):FN{
    const fnRef=useRef(fn)
    fnRef.current=fn
    return useCallback(((...args)=>{
        fnRef.current(...args)
    }) as FN,[])
}