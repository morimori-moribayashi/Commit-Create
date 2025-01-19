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
        const done = items
            .filter(({ checked }) => checked)
            .filter(({ text }) => text.trim() !=='')
            .map(({ text }) => `- ${text}`)
            .join('\n');
        const yet = items
            .filter(({ checked }) => !checked)
            .map(({ text, dropdownValue }) =>
                text.trim() !== ''
                    ? `- ${text.replace(/\n/g,`\n　　`)} \n  (達成率：${dropdownValue} %)`
                    : ''
            )
            .join('');
        if(!comment=='') comment+=`\n`;
        return `お疲れ様です。本日の終業報告をいたします。\n本日のコミットメントは以下のとおりです。\n\n[達成]\n${done}\n\n[未達]\n${yet}\n\n${comment}以上です。よろしくお願いいたします。`;
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
            items: [...prev.items, { checked: false, text: '', dropdownValue: 0 }],
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
        <div>
            <h1>朝会・終業報告自動作成</h1>
            <form>
                <div>
                    <label>職種</label>
                    <input
                        type="text"
                        name="jobType"
                        value={content.job}
                        onChange={(e) => handleInputChange('job', e.target.value)}
                    />
                </div>
                <div>
                    <label>名前</label>
                    <input
                        type="text"
                        name="name"
                        value={content.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                </div>
                <div>
                    <label>コミット</label>
                    <button type="button" onClick={addItem}>
                        追加
                    </button>
                </div>
                {content.items.map((item, index) => (
                    <div key={index}>
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() =>
                                handleItemChange(index, 'checked', !item.checked)
                            }
                        />
                        <textarea
                            value={item.text}
                            onChange={(e) =>
                                handleItemChange(index, 'text', e.target.value)
                            }
                            onKeyDown={(e)=> handleTextAreaEnter(e)}
                            rows={2} cols={75}
                        />
                        <select
                            value={item.dropdownValue}
                            onChange={(e) =>
                                handleItemChange(index, 'dropdownValue', parseInt(e.target.value, 10))
                            }
                        >
                            <option value={0}>達成率を選択</option>
                            {[...Array(10).keys()].map((i) => (
                                <option key={i} value={i * 10}>
                                    {i * 10} %
                                </option>
                            ))}
                        </select>
                        <button type="button" onClick={() => removeItem(index)}>
                            削除
                        </button>
                    </div>
                ))}
                    <br></br>
                        <label>終業報告用コメント</label>
                        <textarea name='comment' rows={2} cols={75} onChange={(e)=>{
                            handleInputChange('comment',e.target.value)
                        }}
                        value={content.comment}
                        ></textarea><br></br>
                <button type="button" onClick={() =>
                    {
                        setContent({ ...content, items: [] ,comment:''})
                        addItem();
                    }
                    }>
                    クリア
                </button>
                <hr></hr>
                <div>
                    <label>朝会</label>
                    <button type="button" onClick={() => copyToClipboard(makeMorning(content))}>
                        コピー
                    </button>
                    <textarea readOnly value={makeMorning(content)} rows={10} cols={100}  />
                </div>
                <div>
                    <label>終業報告</label>
                    <button type="button" onClick={() => copyToClipboard(makeReport(content))}>
                        コピー
                    </button>
                    <textarea readOnly value={makeReport(content)} rows={10} cols={100}  />
                </div>
            </form>
        </div>
    );
};

export default Home;
