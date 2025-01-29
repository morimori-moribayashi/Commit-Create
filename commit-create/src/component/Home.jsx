import clsx from 'clsx';
import React, { useState, useEffect } from 'react';

// 初期値を取得する関数
const getInitialContent = () => {
    const savedData = localStorage.getItem('commit-create-data');
    return savedData
        ? JSON.parse(savedData)
        : {
              job: '',
              name: '',
              items: [{ checked: false, text: '', dropdownValue: 0 }],
              comment: '',
          };
};

const Home = () => {
    const [content, setContent] = useState(getInitialContent);
    // 状態が変化したらローカルストレージに保存（遅延保存の例）
    useEffect(() => {
        const saveToLocalStorage = setTimeout(() => {
            localStorage.setItem('commit-create-data', JSON.stringify(content));
        }, 500); // 500ms遅延保存

        return () => clearTimeout(saveToLocalStorage); // クリーンアップ
    }, [content]);

    // 朝会のメッセージ生成
    const makeMorning = ({ job, name, items }) => {
        const commitList = items
            .filter(({ text }) => text.trim() !== '')
            .map(({ text }) => `- ${text.replace(/\n/g,`\n　　`)}`)
            .join('\n');
        return `おはようございます。${job}の${name}です。\n本日は\n${commitList}\nにコミットします。よろしくお願いいたします。`;
    };

    // 終業報告のメッセージ生成
    const makeReport = ({ items ,comment}) => {
        let done = items
            .filter(({ checked }) => checked)
            .filter(({ text }) => text.trim() !=='')
            .map(({ text }) => `- ${text}`)
            .join('\n');
        
        if(done==='')done='なし';
        let yet = items
            .filter(({ checked }) => !checked)
            .map(({ text, dropdownValue }) =>
                text.trim() !== ''
                    ? `\n- ${text.replace(/\n/g,`\n　　`)} \n  (達成率：${Math.floor(dropdownValue)} %)`
                    : ''
            )
            .join('');
        if(yet=='')yet='\nなし';
        if(!comment=='') comment+=`\n`;
        return `お疲れ様です。本日の終業報告をいたします。\n本日のコミットメントは以下のとおりです。\n\n[達成]\n${done}\n\n[未達]${yet}\n\n${comment}以上です。よろしくお願いいたします。`;
    };

    // 入力変更の処理
    const handleInputChange = (key, value) => {
        setContent((prev) => ({ ...prev, [key]: value }));
    };

    // アイテム変更の処理
    const handleItemChange = (index, key, value) => {
        setContent((prev) => {
            const newItems = [...prev.items];
            newItems[index][key] = value;
            return { ...prev, items: newItems };
        });
    };

    // アイテム追加
    const addItem = () => {
        setContent((prev) => ({
            ...prev,
            items: [...prev.items, { checked: false, text: '', dropdownValue: 0.1 }],
        }));
    };

    // アイテム削除
    const removeItem = (index) => {
        setContent((prev) => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    // クリップボードにコピー
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };
    const copyBtn_default = {copied:false,label:'コピー'};
    const [copyBtn,setCopyBtn] = useState([{...copyBtn_default,type:'morning'},{...copyBtn_default,type:'report'}]);
    //コピーボタンを押したときの処理
    function handleCopyButton(index){
        if(copyBtn[index].copied)return;
        if(index==0)copyToClipboard(makeMorning(content));
        if(index==1)copyToClipboard(makeReport(content));
        setCopyBtn((prev)=>{
            return prev.map((obj,i)=>{
                if(i===index){
                    return {
                        ...obj,
                        copied:true,
                        label:'コピーしました！！',
                    };
                }
                return obj;
            })
        })
    }  
    useEffect(() => {
        if (copyBtn.every((obj) => obj.copied === false)) {
            return;
        }
    
        const timer = setTimeout(() => {
            setCopyBtn(copyBtn.map((obj) => ({ ...obj, copied: false, label: 'コピー' })));
        }, 2000);
    
        return () => clearTimeout(timer);
    }, [copyBtn]);

    function handleTextAreaEnter(e){
        if(e.keyCode===13 && !e.shiftKey ){
            e.preventDefault();
        }
        if(e.keyCode===13 && (e.ctrlKey || e.metaKey)){
            e.preventDefault();
            addItem();
        }
    }

    return (
        <div className={clsx(
            'w-full flex-col justify-center mx-0 -my-8',
            'md:w-3/5 md:min-w-[768px] md:mx-auto md:max-w-[1024px]'
        )}>
            <h1 className={clsx(
                'text-xl text-cente font-bold my-8'
            )}>朝会・終業報告自動作成</h1>
            <form className={'w-full space-y-2'}>
                <div 
                className={'mx-0 flex justify-start bg-blue-50 py-2'}
                >
                    <label>職種</label>
                    <input
                        type="text"
                        name="jobType"
                        value={content.job}
                        onChange={(e) => handleInputChange('job', e.target.value)}
                        placeholder='例：エンジニア'
                        className={'border-2 rounded-md mx-1 px-1'}
                    />
                </div>
                <div
                        className={'mx-0 flex justify-start bg-blue-50 py-2'}
                >
                    <label>名前</label>
                    <input
                        type="text"
                        name="name"
                        value={content.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder='例：山田'
                        className={'border-2 rounded-md mx-1 px-1'}
                    />
                </div>
                <hr/>
                <div className={'flex justify-start space-x-3 items-center'}>
                    <label>コミット</label>
                    <button type="button" onClick={addItem}
                    className={'bg-orange-500 text-white px-3 py-1 rounded-xl text-xs transform scale-90'}
                    >
                        追加
                    </button>
                </div>
                {content.items.map((item, index) => (
                    <div key={index} className={'flex-col content-start bg-orange-50 p-2 rounded'}>
                        <div className={'flex-col justify-start'}>
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() =>
                                    handleItemChange(index, 'checked', !item.checked)
                                }
                                className={clsx(
                                    'z-10 w-5 h-5 rounded border-gray-400 block ml-2 translate-y-7 -mt-5',
                                )}
                            />
                            <textarea
                                value={item.text}
                                onChange={(e) =>
                                    handleItemChange(index, 'text', e.target.value)
                                }
                                onKeyDown={(e)=> handleTextAreaEnter(e)}
                                className={'z-0 w-full pl-8 py-1 border-2 rounded h-fit resize-none '}
                            />
                        </div>
                        <div className={'flex justify-between my-1'}>
                           {!item.checked?
                            <select
                                value={item.dropdownValue}
                                onChange={(e) =>{
                                    handleItemChange(index, 'dropdownValue',parseFloat(e.target.value))
                                }
                                }
                            >
                                <option value={0.1}>達成率</option>
                                {[...Array(10).keys()].map((i) => (
                                    <option key={i} value={i * 10}>
                                        {i * 10} %
                                    </option>
                                ))}
                            </select>
                           :
                                <div>100%</div>
                           }
                           
                        <button type="button" onClick={() => removeItem(index)}
                            className={'text-orange-600 active:text-red-600 active:underline underline-offset-2 p-auto mr-1'}
                            >
                            削除
                        </button>
                        </div>
                    </div>
                ))}
                        <div className={'bg-orange-50 px-3 py-2'}>
                            <div className={'flex'}><label>終業報告用コメント</label></div>
                            <textarea name='comment'  onChange={(e)=>{
                                handleInputChange('comment',e.target.value)
                            }}
                            value={content.comment}
                            placeholder='なにかコメントがあれば入力'
                            className={'w-full min-h-12 border-2 resize-none p-1'}
                            ></textarea>
                        </div>
                <div>
                    <button type="button" onClick={() =>
                        {
                            setContent({ ...content, items: [] ,comment:''})
                            addItem();
                        }
                        }
                        className={'border-blue-400 border-2 px-5 py-1 text-blue-400 rounded-2xl my-5 transform scale-75'}
                        >
                        クリア
                    </button>
                </div>
                <hr></hr>
                <div>
                    <div className={'flex justify-between my-3'}>
                        <label>朝会</label>
                        <button type="button" onClick={() => handleCopyButton(0)}                        
                        className={clsx(
                            'border-orange-500 px-3 py-1 rounded-xl text-xs transform scale-90',
                            'active:transform active:scale-75 duration-500 border-2',
                            !copyBtn[0].copied?'bg-orange-500 text-white':'bg-white text-orange-500',
                        )}
                            >
                            {copyBtn[0].label}
                        </button>
                    </div>
                    <textarea readOnly value={makeMorning(content)}  
                    className={'border-2 border-black text-xs w-full  max-h-56 p-1'}
                    />
                </div>
                <div>
                    <div className={'flex justify-between my-3'}>
                        <label>終業報告</label>
                        <button type="button" onClick={() => handleCopyButton(1)}                        
                        className={clsx(
                            'border-orange-500 px-3 py-1 rounded-xl text-xs transform scale-90',
                            'active:transform active:scale-75 duration-500 border-2',
                            !copyBtn[1].copied?'bg-orange-500 text-white':'bg-white text-orange-500',
                        )}
                            >
                            {copyBtn[1].label}
                        </button>

                    </div>
                    <textarea readOnly value={makeReport(content)} 
                    className={'border-2 border-black text-xs w-full  max-h-56 p-1'}
                    />
                </div>
            </form>
            <div className={'my-7'}><a href='https://github.com/morimori-moribayashi/Commit-Create'>GitHub</a> / <a href='https://github.com/morimori-moribayashi/Commit-Create/wiki'>使い方</a></div>
        </div>
    );
};

export default Home;
