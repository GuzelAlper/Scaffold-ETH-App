"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { EtherInput } from "../components/scaffold-eth/Input/EtherInput";

const Home = () => {
  // Hata 3 Çözümü: Türü string olarak belirlendi
  const [betAmount, setBetAmount] = useState<string>("");
  // Hata 4 Çözümü: BigInt uyumsuzluğu için türü bigint olarak güncellendi
  const [selectedOutcome, setSelectedOutcome] = useState<bigint>(1n);

  const { writeContractAsync: writeBettingContract } = useScaffoldWriteContract("BettingContract");

  // Hata 2 Çözümü: currentOutcome türü bigint olarak bekleniyor
  const { data: currentOutcome } = useScaffoldReadContract({
    contractName: "BettingContract",
    functionName: "currentOutcome",
    watch: true,
  });

  const { data: contractBalance } = useScaffoldReadContract({
    contractName: "BettingContract",
    functionName: "getContractBalance",
    watch: true,
  });

  // Hata 2 & 5 Çözümü: Parametre bigint | undefined olarak netleştirildi
  const outcomeToString = (outcome: bigint | undefined): string => {
    if (outcome === undefined) return "Загрузка...";
    switch (outcome) {
      case 0n: return "Ожидание (PENDING)";
      case 1n: return "Команда А Побediла";
      case 2n: return "Команда Б Побediла";
      case 3n: return "Ничья (DRAW)";
      default: return "Неизвестный результат";
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">Децентрализованная Система Ставок</h1>
        <div className="bg-base-100 p-4 rounded-2xl shadow-md mb-6 border border-primary text-black">
          {/* Canlı Bakiye Senkronizasyonu */}
          <p className="text-xl font-bold">Общий баланс контракта: {contractBalance ? formatEther(contractBalance) : "0"} ETH</p>
          <p className="text-lg">Статус: {outcomeToString(currentOutcome !== undefined ? BigInt(currentOutcome) : undefined)}</p>
        </div>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-10 px-8 py-12 flex flex-col items-center text-black">
        <div className="bg-base-100 p-8 rounded-3xl shadow-xl w-full max-w-md border-2 border-primary">
          <h2 className="text-2xl font-bold mb-4 text-center">Сделать ставку</h2>
          <div className="flex flex-col gap-4">
            <select 
              className="select select-bordered w-full text-black"
              value={selectedOutcome.toString()}
              onChange={(e) => setSelectedOutcome(BigInt(e.target.value))}
            >
              <option value={1}>Команда А</option>
              <option value={2}>Команда Б</option>
              <option value={3}>Ничья</option>
            </select>
            
            {/* Hata 3 Çözümü: amount türü string olarak belirtildi */}
            <EtherInput value={betAmount} onChange={(amount: string) => setBetAmount(amount)} />
            
            <button 
              className="btn btn-primary w-full" 
              disabled={!betAmount}
              onClick={async () => {
                try {
                  await writeBettingContract({
                    functionName: "placeBet",
                    args: [Number(selectedOutcome)], // Hata 4: Bigint'i Number'a dönüştürdük
                    value: parseEther(betAmount),
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Поставить ETH
            </button>
          </div>
        </div>

        {/* Admin Paneli - Hata 5 Çözümü: 1n, 2n, 3n kullanımı bigint ile tam uyumlu */}
        <div className="mt-8 bg-base-100 p-6 rounded-3xl shadow-lg w-full max-w-md border-2 border-warning text-black">
          <h2 className="text-xl font-bold mb-4 text-center text-warning">Панель Владельца</h2>
          <div className="flex flex-wrap justify-center gap-2 text-black">
            <button className="btn btn-xs btn-outline" onClick={() => writeBettingContract({ functionName: "announceResult", args: [1] })}>Победа А</button>
            <button className="btn btn-xs btn-outline" onClick={() => writeBettingContract({ functionName: "announceResult", args: [2] })}>Победа Б</button>
            <button className="btn btn-xs btn-outline" onClick={() => writeBettingContract({ functionName: "announceResult", args: [3] })}>Ничья</button>
            <button 
  className="btn btn-error w-full mt-4" 
  onClick={async () => {
    try {
      // Bu fonksiyon kontrattaki tüm parayı yöneticiye çeker ve bakiyeyi sıfırlar
      await writeBettingContract({ 
        functionName: "withdrawFunds" 
      });
    } catch (e) {
      console.error("Sıfırlama Hatası:", e);
    }
  }}
>
  Bakiyeyi Sıfırla (0 ETH yap)
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;